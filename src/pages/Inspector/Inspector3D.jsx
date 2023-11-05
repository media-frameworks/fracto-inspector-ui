import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import {Point3d} from "common/math/Vector";
import HolodeckUtil from "common/threed/holodeck/HolodeckUtil";

import RasterCanvas3D from "fracto/common/render/RasterCanvas3D";
import FractoData, {get_ideal_level} from "fracto/common/data/FractoData";
import FractoMruCache, {TILE_CACHE} from "fracto/common/data/FractoMruCache";
import FractoUtil from "fracto/common/FractoUtil";

const GRID_FACTOR = 2

const InspectorWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.narrow_box_shadow}
   background-color: white;
`;

export class Inspector3D extends Component {

   static propTypes = {
      canvas_size_px: PropTypes.number.isRequired,
      holodeck_controls: PropTypes.object.isRequired,
      update_counter: PropTypes.number.isRequired,
      on_controls_change: PropTypes.func.isRequired,
      on_plan_complete: PropTypes.func.isRequired,
   }

   state = {
      grid_vectors: null,
      all_tiles: [],
      local_cache: {}
   }

   componentDidMount() {
      this.prepare_render()
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      const canvas_size_px_changed = prevProps.canvas_size_px !== this.props.canvas_size_px
      const update_counter_changed = prevProps.update_counter !== this.props.update_counter
      if (canvas_size_px_changed || update_counter_changed) {
         this.prepare_render()
      }
   }

   prepare_render = () => {
      const {holodeck_controls, canvas_size_px} = this.props
      const grid_vectors = HolodeckUtil.compute_grid_vectors(holodeck_controls);

      console.log("holodeck_controls", holodeck_controls)
      console.log("grid_vectors", grid_vectors)

      const scope = Point3d.magnitude(grid_vectors.pov_vector.direction);
      const focal_point = {
         x: holodeck_controls.focal_x,
         y: holodeck_controls.focal_y
      }
      const level = get_ideal_level(canvas_size_px, scope)
      const aspect_ratio = 1.0

      const all_tiles = new Array(4).fill([])
      all_tiles[0] = FractoData.tiles_in_scope(level, focal_point, scope, aspect_ratio);
      all_tiles[1] = FractoData.tiles_in_scope(level - 1, focal_point, scope, aspect_ratio);
      all_tiles[2] = FractoData.tiles_in_scope(level - 2, focal_point, scope, aspect_ratio);
      all_tiles[3] = FractoData.tiles_in_scope(level - 3, focal_point, scope, aspect_ratio);

      const all_shortcodes =
         all_tiles[0].map(tile => tile.short_code)
            .concat(all_tiles[1].map(tile => tile.short_code))
            .concat(all_tiles[2].map(tile => tile.short_code))
            .concat(all_tiles[3].map(tile => tile.short_code))

      console.log("all_shortcodes", all_shortcodes)
      FractoMruCache.get_tiles_async(all_shortcodes, result => {
         console.log(`get_tiles_async returns ${all_shortcodes.length} tiles`)
         this.setState({
            grid_vectors: grid_vectors,
            all_tiles: all_tiles
         })
      })
   }

   on_render_pixel = (x, y, img_x, img_y, ctx) => {
      const {all_tiles, local_cache} = this.state
      if (isNaN(x) || isNaN(y)) {
         return;
      }
      let on_grid = false
      if (((Math.abs(x) * 100) % 10) < 0.25) {
         on_grid = true
      } else if (((Math.abs(y)* 100) % 10) < 0.25) {
         on_grid = true
      }

      let completed = false
      for (let i = 0; i < all_tiles.length && !completed; i++) {
         if (!all_tiles[i].length) {
            continue;
         }
         const tile_width = all_tiles[i][0].bounds.right - all_tiles[i][0].bounds.left
         const one_by_tile_width = 1 / tile_width
         const tile = all_tiles[i].find(tile => {
            if (tile.bounds.right < x) {
               return false;
            }
            if (tile.bounds.left > x) {
               return false;
            }
            if (tile.bounds.top < Math.abs(y)) {
               return false;
            }
            if (tile.bounds.bottom > Math.abs(y)) {
               return false;
            }
            return true;
         });
         if (!tile) {
            continue;
         }
         if (!local_cache[tile.short_code]) {
            local_cache[tile.short_code] = TILE_CACHE[tile.short_code]
            // console.log("local_cache[tile.short_code]", tile.short_code, local_cache[tile.short_code])
         }
         const point_data = local_cache[tile.short_code]
         const tile_x = Math.floor(255 * (x - tile.bounds.left) * one_by_tile_width);
         const tile_y = Math.floor(255 * (tile.bounds.top - Math.abs(y)) * one_by_tile_width);
         const [pattern, iterations] = point_data[tile_x][tile_y];
         const with_grid = !pattern && on_grid ? iterations * GRID_FACTOR : iterations
         const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, with_grid)
         ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
         ctx.fillRect(img_x, img_y, 1, 1);
         completed = true;
      }
      if (!completed) {
         const distance = Math.sqrt(x * x + y * y)
         if (distance > 2) {
            const iterations = 4 + (distance - 2) * (distance - 2) * 25
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(0, on_grid ? iterations * GRID_FACTOR : iterations)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
         } else {
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(0, on_grid ? 4 * GRID_FACTOR : 4)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
         }
         ctx.fillRect(img_x, img_y, 1, 1);
      }
   }

   render() {
      const {grid_vectors} = this.state
      const {canvas_size_px, holodeck_controls, update_counter, on_plan_complete} = this.props
      const wrapper_style = {
         width: `${canvas_size_px}px`,
         height: `${canvas_size_px}px`,
      }
      const holodeck_stage = grid_vectors === null ? '' : <RasterCanvas3D
         width_px={canvas_size_px}
         controls={holodeck_controls}
         grid_vectors={grid_vectors}
         on_render_pixel={this.on_render_pixel}
         update_counter={update_counter}
         aspect_ratio={1.0}
         on_plan_complete={ref => on_plan_complete(ref)}
      />
      return <InspectorWrapper
         style={wrapper_style}>
         {holodeck_stage}
      </InspectorWrapper>
   }
}

export default Inspector3D
