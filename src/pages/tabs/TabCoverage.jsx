import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import axios from "axios";
import network from "../../common/config/network.json";

import {CoolStyles} from "common/ui/CoolImports";
import {INSPECTOR_SIZE_PX} from "../constants";
import FractoTileRender from "../../fracto/common/tile/FractoTileRender";
import FractoTileAutomate, {CONTEXT_SIZE_PX} from "../../fracto/common/tile/FractoTileAutomate";
import FractoTileGenerate from "../../fracto/common/tile/FractoTileGenerate";
import FractoTileRunHistory from "../../fracto/common/tile/FractoTileRunHistory"
import FractoIncrementalRender from "../../fracto/common/render/FractoIncrementalRender"
// import FractoMruCache from "../../fracto/common/data/FractoMruCache";
import FractoTileCoverage from "../../fracto/common/tile/FractoTileCoverage";
// import FractoUtil from "../../fracto/common/FractoUtil";
import FractoTileCache, {CACHED_TILES} from "../../fracto/common/data/FractoTileCache";

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

const STATS_INIT = {
   blank: 0,
   interior: 0,
   updated: 0,
   calculated: 0,
}

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
      is_all_pattern: false,
      context_completed: '',
      stats: STATS_INIT,
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

   init_stats = () => {
      this.setState({
         stats: STATS_INIT
      })
   }

   on_select_repair_tile = async (new_index, cb) => {
      const {repair_tiles} = this.state
      this.setState({tile_index: new_index})
      const tile_data = await FractoTileCache.get_tile(repair_tiles[new_index].short_code)
      // FractoMruCache.get_tile_data(repair_tiles[new_index].short_code, (tile_data) => {
         this.setState({repair_tile_data: tile_data})
         this.init_stats()
         setTimeout(() => {
            if (cb) {
               cb(true)
            }
         }, 250)
      // })
   }

   wait_for_context = (short_code, cb) => {
      let countdown = 20;
      const interval = setInterval(() => {
         countdown--;
         if (!countdown) {
            clearInterval(interval)
            cb(false)
         }
         console.log('short_code, this.state.context_completed', short_code, this.state.context_completed)
         if (short_code === this.state.context_completed) {
            clearInterval(interval)
            cb(this.state.is_all_pattern)
         }
      }, 500)
   }

   upload_points = (short_code, tile_points, dir) => {
      const url = `${network["fracto-prod"]}/new_tile.php?short_code=${short_code}&dir=${dir}`
      axios.post(url, tile_points, {
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Access-Control-*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
         },
         mode: 'no-cors',
         crossdomain: true,
      })
   }

   enhance = (tile, cb) => {
      const {all_history, tile_index, stats, repair_tiles} = this.state
      const {ctx, scope, focal_point, canvas_buffer} = this.props
      if (all_history.length > 100) {
         all_history.pop();
      }
      this.wait_for_context(tile.short_code, is_all_pattern => {
         if (is_all_pattern) {
            // skip it
            const history_item = FractoTileRunHistory.format_history_item(
               tile, "coverage", "skipping deep interior tile", tile_index)
            history_item.elapsed = 0
            all_history.push(history_item)
            stats.interior += 1
            this.setState({all_history, stats})
            this.upload_points(tile.short_code, {}, 'interior')
            // const url = `${network["fracto-prod"]}/new_tile.php?short_code=${tile.short_code}&dir=interior`
            // axios.post(url, {})

            // FractoUtil.tile_to_bin(tile.short_code, 'ready', 'interior', ok => {
            //    console.log('tile_to_bin', ok)
            //    cb(true)
            // })
         } else {
            const start = performance.now()
            FractoTileGenerate.begin(tile, (history, tile_points) => {
               console.log("history, tile_points", history, tile_points)
               const is_blank = history.indexOf('blank') > 0
               const is_updated = repair_tiles.length > 0
               if (is_blank) {
                  stats.blank += 1
                  this.upload_points(tile.short_code, {}, 'blank')
                  // const url = `${network["fracto-prod"]}/new_tile.php?short_code=${tile.short_code}&dir=blank`
                  // axios.post(url, {})
               } else if (is_updated) {
                  stats.updated += 1
                  this.upload_points(tile.short_code, tile_points, 'updated')
                  delete CACHED_TILES[tile.short_code]
                  // const url = `${network["fracto-prod"]}/new_tile.php?short_code=${tile.short_code}&dir=updated`
                  // axios.post(url, tile_points)
               } else {
                  stats.calculated += 1
                  this.upload_points(tile.short_code, tile_points, 'new')
                  // const url = `${network["fracto-prod"]}/new_tile.php?short_code=${tile.short_code}&dir=new`
                  // axios.post(url, tile_points)
               }
               if (tile_points) {
                  FractoIncrementalRender.tile_to_canvas(
                     ctx, tile, focal_point, scope, 1.0,
                     INSPECTOR_SIZE_PX, INSPECTOR_SIZE_PX, tile_points,
                     canvas_buffer)
                  this.setState({repair_tile_data: tile_points})
               }
               const end = performance.now()
               const history_item = FractoTileRunHistory.format_history_item(
                  tile, "coverage", history, tile_index)
               history_item.elapsed = end - start
               all_history.push(history_item)
               this.setState({history, tile_points})
               cb(true)
            })
         }
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
      const {all_history, tile_index, run_tile_index_start, run_start, stats} = this.state;
      const timer_now = performance.now()
      const run_count = tile_index - run_tile_index_start
      const tiles_per_minute = 60 * 1000 * (run_count) / (timer_now - run_start)
      const rounded_tiles_per_minute = Math.round(100 * tiles_per_minute) / 100
      const blank_stats = stats.blank ? `${stats.blank} blank` : ''
      const interior_stats = stats.interior ? `${stats.interior} interior` : ''
      const updated_stats = stats.updated ? `${stats.updated} updated` : ''
      const calculated_stats = stats.calculated ? `${stats.calculated} new` : ''
      const all_stats = [blank_stats, interior_stats, updated_stats, calculated_stats]
      const stats_str = all_stats.filter(stat => stat.length > 1).join(', ')
      return <SummaryWrapper>
         {!all_history.length ? '' : `${run_count} results this run (${rounded_tiles_per_minute} tiles/min): ${stats_str}`}
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
         this.init_stats()
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
      this.init_stats()
   }

   on_level_selected = (level) => {
      const {on_level_selected} = this.props
      console.log(`on_level_selected: ${level}`)
      on_level_selected(level)
   }

   on_context_rendered = (canvas_buffer, ctx) => {
      const {tile_index, enhance_tiles} = this.state
      let is_all_pattern = true
      for (let img_x = 0; img_x < canvas_buffer.length; img_x++) {
         for (let img_y = 0; img_y < canvas_buffer[img_x].length; img_y++) {
            if (canvas_buffer[img_x][img_y][0] === 0) {
               is_all_pattern = false
               break
            }
         }
         if (!is_all_pattern) {
            break;
         }
      }
      const tile = enhance_tiles[tile_index]
      this.setState({
         context_completed: tile.short_code,
         is_all_pattern
      })
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
            on_context_rendered={this.on_context_rendered}
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
