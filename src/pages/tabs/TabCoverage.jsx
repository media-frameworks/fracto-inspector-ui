import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import {INSPECTOR_SIZE_PX} from "../constants";
import FractoTileRender from "../../fracto/common/tile/FractoTileRender";
import FractoTileAutomate, {CONTEXT_SIZE_PX} from "../../fracto/common/tile/FractoTileAutomate";
import FractoTileGenerate from "../../fracto/common/tile/FractoTileGenerate";
import FractoTileRunHistory from "../../fracto/common/tile/FractoTileRunHistory"
import FractoIncrementalRender from "../../fracto/common/render/FractoIncrementalRender"
import FractoMruCache from "../../fracto/common/data/FractoMruCache";
import FractoTileCoverage from "../../fracto/common/tile/FractoTileCoverage";

const SectionWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   padding: 0.5rem;
   background-color: white;
   margin-left: 1rem;
`

const SummaryWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.italic}
   font-size: 1.25rem;
   margin-left: 1rem;
   color: #888888;
`;

export class TabCoverage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      selected_level: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      on_level_selected: PropTypes.func.isRequired,
   }

   static defaultProps = {}

   state = {
      tiles_in_scope: [],
      tile_index: 0,
      all_history: [],
      enhance_tiles: [],
      repair_tiles: [],
      enhance_level: 0,
      repair_level: 0,
      run_start: null,
      run_tile_index_start: 0,
      selected_row: -1,
      repair_tile_data: [],
   }

   on_select_row = (new_selected_row) => {
      const {selected_row} = this.state
      if (selected_row === new_selected_row) {
         this.setState({selected_row: -1})
      } else {
         this.setState({selected_row: new_selected_row})
      }
   }

   on_select_tile = (new_index, cb) => {
      this.setState({tile_index: new_index})
      setTimeout(() => {
         if (cb) {
            cb(true)
         }
      }, 50)
   }

   on_select_repair_tile = (new_index, cb) => {
      const {repair_tiles} = this.state
      this.setState({tile_index: new_index})
      FractoMruCache.get_tile_data(repair_tiles[new_index].short_code, (tile_data) => {
         this.setState({repair_tile_data: tile_data})
         setTimeout(() => {
            if (cb) {
               cb(true)
            }
         }, 50)
      })
   }

   enhance = (tile, cb) => {
      const {all_history} = this.state
      const {ctx, scope, focal_point, canvas_buffer} = this.props
      const start = performance.now()
      FractoTileGenerate.begin(tile, (history, tile_points) => {
         // console.log("history, tile_points", history, tile_points)
         const end = performance.now()
         if (tile_points) {
            FractoIncrementalRender.tile_to_canvas(
               ctx,
               tile,
               focal_point,
               scope,
               1.0,
               INSPECTOR_SIZE_PX,
               INSPECTOR_SIZE_PX,
               tile_points,
               canvas_buffer)
         }
         const history_item = FractoTileRunHistory.format_history_item(tile, "coverage", history)
         history_item.elapsed = end - start
         all_history.push(history_item)
         this.setState({history, tile_points})
         cb(true)
      })
   }

   on_render_tile = (tile, width_px) => {
      const {tile_points} = this.state
      if (!tile_points) {
         return <CoolStyles.InlineBlock style={{width: `${width_px}px`}}>
            {'no tile points'}
         </CoolStyles.InlineBlock>
      }
      return <FractoTileRender
         key={`render-${tile.short_code}`}
         tile={tile}
         width_px={width_px}
         tile_data={tile_points}/>
   }

   on_render_repair_tile = (tile, width_px) => {
      const {repair_tile_data} = this.state
      return <FractoTileRender
         key={`render-${tile.short_code}`}
         tile={tile}
         width_px={width_px}
         tile_data={repair_tile_data}/>
   }

   render_run_history_summary = () => {
      const {all_history, tile_index, run_tile_index_start, run_start} = this.state;
      const timer_now = performance.now()
      const tiles_per_minute = 60 * 1000 * (tile_index - run_tile_index_start) / (timer_now - run_start)
      const rounded_tiles_per_minute = Math.round(100 * tiles_per_minute) / 100
      return <SummaryWrapper>
         {!all_history.length ? '' : `${all_history.length} results this run (${rounded_tiles_per_minute} tiles/min)`}
      </SummaryWrapper>
   }

   on_automate = (automate) => {
      const {tile_index} = this.state
      if (automate) {
         console.log("starting run timer")
         const run_start = performance.now()
         this.setState({
            run_start: run_start,
            run_tile_index_start: tile_index,
            all_history: [],
         })
      }
   }

   on_tile_set_changed = (tile_set, level, is_repair) => {
      if (is_repair) {
         this.setState({
            repair_tiles: tile_set,
            enhance_tiles: [],
            repair_level: level,
            tile_index: 0,
            all_history: [],
         })
      } else {
         this.setState({
            enhance_tiles: tile_set,
            repair_tiles: [],
            enhance_level: level,
            tile_index: 0,
            all_history: [],
         })
      }
   }

   on_level_selected = (level) => {
      const {on_level_selected} = this.props
      console.log(`on_level_selected: ${level}`)
      on_level_selected(level)
   }

   render() {
      const {
         tile_index, all_history,
         enhance_tiles, enhance_level,
         repair_tiles, repair_level
      } = this.state
      const {width_px, scope, focal_point, selected_level} = this.props
      const coverage2 = <FractoTileCoverage
         scope={scope}
         focal_point={focal_point}
         width_px={width_px}
         on_tile_set_changed={this.on_tile_set_changed}
         selected_level={selected_level}
         on_level_selected={level => this.on_level_selected(level)}
      />
      let automate = []
      if (enhance_tiles.length) {
         const sorted = enhance_tiles.sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         })
         automate = <FractoTileAutomate
            tile_action={this.enhance}
            tile_index={tile_index}
            level={enhance_level}
            on_tile_select={this.on_select_tile}
            tile_size_px={CONTEXT_SIZE_PX}
            on_render_tile={this.on_render_tile}
            all_tiles={sorted}
            on_automate={this.on_automate}
         />
      } else if (repair_tiles.length) {
         const sorted = repair_tiles.sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         })
         automate = <FractoTileAutomate
            tile_action={this.enhance}
            tile_index={tile_index}
            level={repair_level}
            on_tile_select={this.on_select_repair_tile}
            tile_size_px={CONTEXT_SIZE_PX}
            on_render_tile={this.on_render_repair_tile}
            all_tiles={sorted}
            on_automate={this.on_automate}
         />
      }
      const history = all_history.length ? <FractoTileRunHistory
         width_px={width_px}
         history_items={all_history}
      /> : []
      const history_summary = this.render_run_history_summary()
      return [coverage2, automate, history_summary, history].map((item, i) => {
         return <SectionWrapper key={`section-${i}`}>{item}</SectionWrapper>
      })
   }
}

export default TabCoverage;
