import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import FractoIndexedTiles from "fracto/common/data/FractoIndexedTiles";
import CoolTable, {CELL_ALIGN_CENTER, CELL_TYPE_CALLBACK, CELL_TYPE_NUMBER} from "../../common/ui/CoolTable";
import {get_ideal_level} from "../../fracto/common/data/FractoData";
import {INSPECTOR_SIZE_PX} from "../constants";
import FractoTileRender from "../../fracto/common/tile/FractoTileRender";
import FractoUtil from "../../fracto/common/FractoUtil";
import FractoTileAutomate, {CONTEXT_SIZE_PX} from "../../fracto/common/tile/FractoTileAutomate";
import FractoTileGenerate from "../../fracto/common/tile/FractoTileGenerate";
import FractoTileRunHistory from "../../fracto/common/tile/FractoTileRunHistory"

const SectionWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   padding: 0.5rem;
   background-color: white;
`

const COVERAGE_TABLE_COLUMNS = [
   {
      id: "level",
      label: "level",
      type: CELL_TYPE_NUMBER,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "tile_count",
      label: "tile count",
      type: CELL_TYPE_NUMBER,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "can_do",
      label: "can do",
      type: CELL_TYPE_NUMBER,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
]

export class InspectorCoverage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      ctx: PropTypes.object.isRequired,
   }

   static defaultProps = {}

   state = {
      tiles_in_scope: [],
      tile_index: 0,
      all_history: [],
      enhance_tiles: [],
      enhance_level: 0,
      loading_short_codes: true,
   }

   static all_short_codes = null

   componentDidMount() {
      if (!InspectorCoverage.all_short_codes) {
         InspectorCoverage.all_short_codes = {}
         FractoIndexedTiles.load_short_codes('indexed', short_codes => {
            this.setState({short_codes})
            short_codes.forEach(short_code => InspectorCoverage.all_short_codes[short_code] = true)
            this.setState({loading_short_codes: false})
            this.detect_coverage()
         })
      } else {
         this.setState({loading_short_codes: false})
         this.detect_coverage()
      }
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      const {focal_point, scope} = this.props
      const focal_point_x_changed = focal_point.x !== prevProps.focal_point.x
      const focal_point_y_changed = focal_point.y !== prevProps.focal_point.y
      const scope_changed = scope !== prevProps.scope
      if (focal_point_y_changed || focal_point_x_changed || scope_changed) {
         this.detect_coverage()
      }
   }

   detect_coverage = () => {
      const {focal_point, scope} = this.props
      const tiles_in_scope = []
      const ideal_level = get_ideal_level(INSPECTOR_SIZE_PX, scope, 1.5)

      for (let level = 2; level < ideal_level + 12; level++) {
         const level_tiles = FractoIndexedTiles.tiles_in_scope(level, focal_point, scope)
         tiles_in_scope.push({
            level: level,
            tiles: level_tiles
         })
      }
      // console.log('tiles_in_scope', tiles_in_scope)
      const filtered_tiles_in_scope = tiles_in_scope
         .filter(scoped => scoped.tiles.length > 3)
      this.setState({tiles_in_scope: filtered_tiles_in_scope})
   }

   set_enhanced = (enhance_tiles, level) => {
      console.log('set_enhanced', enhance_tiles, level)
      this.setState({
         enhance_tiles: enhance_tiles,
         enhance_level: level
      })
   }

   render_coverage = () => {
      const {tiles_in_scope} = this.state
      let all_tiles = []
      const coverage_data = tiles_in_scope.map(scoped => {
         all_tiles = all_tiles.concat(scoped.tiles)
         return {
            level: scoped.level,
            tile_count: scoped.tiles.length,
            tiles: scoped.tiles,
         }
      })
      if (tiles_in_scope.length) {
         coverage_data.push({
            level: tiles_in_scope[tiles_in_scope.length - 1].level + 1,
            tile_count: 0,
            tiles: [],
         })
      }
      // console.log('coverage_data', coverage_data)
      const can_do = []
      all_tiles.forEach(tile => {
         const short_code = tile.short_code
         const short_code_0 = `${short_code}0`
         const short_code_1 = `${short_code}1`
         const short_code_2 = `${short_code}2`
         const short_code_3 = `${short_code}3`
         if (!InspectorCoverage.all_short_codes[short_code_0]) {
            can_do.push(short_code_0)
         }
         if (!InspectorCoverage.all_short_codes[short_code_1]) {
            can_do.push(short_code_1)
         }
         if (!InspectorCoverage.all_short_codes[short_code_2]) {
            can_do.push(short_code_2)
         }
         if (!InspectorCoverage.all_short_codes[short_code_3]) {
            can_do.push(short_code_3)
         }
      })
      coverage_data.forEach(data => {
         const filtered_by_level = can_do
            .filter(cd => cd.length === data.level)
            .map(short_code => {
               return {
                  short_code,
                  bounds: FractoUtil.bounds_from_short_code(short_code)
               }
            })
         data.can_do = filtered_by_level.length ? <CoolStyles.LinkSpan
            onClick={e => this.set_enhanced(filtered_by_level, data.level)}>
            {filtered_by_level.length}
         </CoolStyles.LinkSpan> : '-'
      })
      return <CoolStyles.InlineBlock>
         <CoolTable data={coverage_data} columns={COVERAGE_TABLE_COLUMNS}/>
      </CoolStyles.InlineBlock>
   }

   on_select_tile = (new_index, cb) => {
      this.setState({tile_index: new_index})
      setTimeout(() => {
         if (cb) {
            cb(true)
         }
      }, 50)
   }

   enhance = (tile, cb) => {
      const {all_history} = this.state
      // console.log('enhance', tile)
      const start = performance.now()
      FractoTileGenerate.begin(tile, (history, tile_points) => {
         // console.log("history, tile_points", history, tile_points)
         const end = performance.now()
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

   render() {
      const {tile_index, all_history, enhance_tiles, enhance_level, loading_short_codes} = this.state
      const {width_px} = this.props
      if (loading_short_codes) {
         return "loading short codes..."
      }
      const coverage = this.render_coverage()
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
            all_tiles={sorted}/>
      }
      const history = all_history.length ? <FractoTileRunHistory
         width_px={width_px}
         history_items={all_history}
      /> : []
      return [coverage, automate, history].map((item, i) => {
         return <SectionWrapper key={`section-${i}`}>{item}</SectionWrapper>
      })
   }
}

export default InspectorCoverage;
