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

const ContentWrapper = styled(CoolStyles.Block)`
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
      tile_index: 0
   }

   componentDidMount() {
      this.detect_coverage()
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

      for (let level = 2; level < ideal_level + 4; level++) {
         const level_tiles = FractoIndexedTiles.tiles_in_scope(level, focal_point, scope)
         tiles_in_scope.push({
            level: level,
            tiles: level_tiles
         })
      }
      // console.log('tiles_in_scope', tiles_in_scope)
      const filtered_tiles_in_scope = tiles_in_scope
         .filter(scoped => scoped.tiles.length > 3 && scoped.tiles.length < 750)
      this.setState({tiles_in_scope: filtered_tiles_in_scope})
   }

   render_coverage = () => {
      const {tiles_in_scope} = this.state
      const coverage_data = tiles_in_scope.map(scoped => {
         return {
            level: scoped.level,
            tile_count: scoped.tiles.length
         }
      })
      return [
         <CoolTable data={coverage_data} columns={COVERAGE_TABLE_COLUMNS}/>,
      ]
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
      // console.log('enhance', tile)
      FractoTileGenerate.begin(tile, (history, tile_points) => {
         // console.log("history, tile_points", history, tile_points)
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
      const {tiles_in_scope, tile_index, history} = this.state
      const coverage = this.render_coverage()
      let automate = []
      if (tiles_in_scope.length) {
         const enhance_tiles = []
         const scoped_tiles = tiles_in_scope[tiles_in_scope.length - 1]
         for (let index = 0; index < scoped_tiles.tiles.length; index++) {
            const base_tile = scoped_tiles.tiles[index]
            let new_short_code = `${base_tile.short_code}0`
            enhance_tiles.push({
               short_code: new_short_code,
               bounds: FractoUtil.bounds_from_short_code(new_short_code)
            })
            new_short_code = `${base_tile.short_code}1`
            enhance_tiles.push({
               short_code: new_short_code,
               bounds: FractoUtil.bounds_from_short_code(new_short_code)
            })
            new_short_code = `${base_tile.short_code}2`
            enhance_tiles.push({
               short_code: new_short_code,
               bounds: FractoUtil.bounds_from_short_code(new_short_code)
            })
            new_short_code = `${base_tile.short_code}3`
            enhance_tiles.push({
               short_code: new_short_code,
               bounds: FractoUtil.bounds_from_short_code(new_short_code)
            })
         }
         const sorted = enhance_tiles.sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         })
         automate = <FractoTileAutomate
            tile_action={this.enhance}
            tile_index={tile_index}
            level={scoped_tiles.level}
            on_tile_select={this.on_select_tile}
            tile_size_px={CONTEXT_SIZE_PX}
            on_render_tile={this.on_render_tile}
            all_tiles={sorted}/>
      }
      return <ContentWrapper>
         {coverage}
         <CoolStyles.Block>{history}</CoolStyles.Block>
         {automate}
      </ContentWrapper>
   }
}

export default InspectorCoverage;
