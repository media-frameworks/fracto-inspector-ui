import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import axios from "axios";
import network from "common/config/network.json";

import {CoolStyles, CoolSelect} from "common/ui/CoolImports";
import BailiwickData from "fracto/common/feature/BailiwickData";
import BailiwickList from "fracto/common/ui/BailiwickList";
import FractoCanvasOverlay from "fracto/common/ui/FractoCanvasOverlay";
import FractoUtil from "fracto/common/FractoUtil";
import {INSPECTOR_SIZE_PX} from "../constants";
import {BailiwickStyles as styles} from 'fracto/common/styles/BailiwickStyles'

const SELECTED_BAILIWICK_KEY = "selected_bailiwick";
const LS_BAILIWICK_ORDERING_KEY = 'ls_bailiwick_ordering_key'

const ContentWrapper = styled(CoolStyles.Block)`
    background-color: white;
    overflow: hidden;
`

const SelectWrapper = styled(CoolStyles.InlineBlock)`
    padding: 0.5rem;
    margin: 0;
    height: 35rem;
    overflow-y: scroll;
    overflow-x: hidden;
`

const ControlsWrapper = styled(CoolStyles.Block)`
    padding: 0.5rem;
    margin: 0;
`

const Spacer = styled(CoolStyles.InlineBlock)`
    width: 1rem;
`

const ORDERING_BY_SM_TO_LG = 'small to large'
const ORDERING_BY_LG_TO_SM = 'large to small'
const ORDERING_BY_MOST_RECENT = 'most recent'
const ORDERING_BY_LEAST_RECENT = 'least recent'
const ORDERING_BY_CREATED_FIRST = 'created first'
const ORDERING_BY_CREATED_LAST = 'created last'
const ORDERING_BY_ORBITAL_LOW_TO_HIGH = 'orbital low to high'
const ORDERING_BY_ORBITAL_HIGH_TO_LOW = 'orbital high to low'

const ordering_options = [
   {label: ORDERING_BY_SM_TO_LG, value: ORDERING_BY_SM_TO_LG},
   {label: ORDERING_BY_LG_TO_SM, value: ORDERING_BY_LG_TO_SM},
   {label: ORDERING_BY_MOST_RECENT, value: ORDERING_BY_MOST_RECENT},
   {label: ORDERING_BY_LEAST_RECENT, value: ORDERING_BY_LEAST_RECENT},
   {label: ORDERING_BY_CREATED_FIRST, value: ORDERING_BY_CREATED_FIRST},
   {label: ORDERING_BY_CREATED_LAST, value: ORDERING_BY_CREATED_LAST},
   {label: ORDERING_BY_ORBITAL_HIGH_TO_LOW, value: ORDERING_BY_ORBITAL_HIGH_TO_LOW},
   {label: ORDERING_BY_ORBITAL_LOW_TO_HIGH, value: ORDERING_BY_ORBITAL_LOW_TO_HIGH},
]

const order_bailiwicks = (all_bailiwicks, ordering) => {
   return all_bailiwicks.sort((a, b) => {
      switch (ordering) {
         case ORDERING_BY_LEAST_RECENT:
            return a.updated_at > b.updated_at ? 1 : -1
         case ORDERING_BY_MOST_RECENT:
            return a.updated_at > b.updated_at ? -1 : 1
         case ORDERING_BY_SM_TO_LG:
            return a.magnitude > b.magnitude ? 1 : -1
         case ORDERING_BY_LG_TO_SM:
            return a.magnitude > b.magnitude ? -1 : 1
         case ORDERING_BY_CREATED_FIRST:
            return a.id > b.id ? 1 : -1
         case ORDERING_BY_CREATED_LAST:
            return a.id > b.id ? -1 : 1
         case ORDERING_BY_ORBITAL_HIGH_TO_LOW:
            if (a.pattern === b.pattern) {
               return a.magnitude > b.magnitude ? 1 : -1
            }
            return a.pattern > b.pattern ? -1 : 1
         default:
         case ORDERING_BY_ORBITAL_LOW_TO_HIGH:
            if (a.pattern === b.pattern) {
               return a.magnitude > b.magnitude ? -1 : 1
            }
            return a.pattern > b.pattern ? 1 : -1
      }
   })
}

export class TabBailiwicks extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      update_counter: PropTypes.number.isRequired,
      ctx: PropTypes.object.isRequired,
      canvas_buffer: PropTypes.array.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      all_bailiwicks: [],
      bailiwick: null,
      canvas_bounds: {},
      visible_bailiwicks: [],
      list_all: true,
      ordering: ORDERING_BY_LEAST_RECENT,
      select_index: 0,
      is_published: false,
   }

   componentDidMount() {
      let ordering = localStorage.getItem(LS_BAILIWICK_ORDERING_KEY)
      if (!ordering) {
         ordering = ORDERING_BY_ORBITAL_LOW_TO_HIGH
      }
      this.setState({ordering})
      this.fetch_bailiwicks()
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {update_counter, scope, focal_point, in_wait} = this.props
      // if (!all_bailiwicksall_bailiwicks.length) {
      //    this.fetch_bailiwicks()
      //    return;
      // }
      const update_counter_changed = update_counter !== prevProps.update_counter
      const in_wait_changed = in_wait !== prevProps.in_wait
      const scope_changed = scope !== prevProps.scope
      const focal_point_changed = focal_point.x !== prevProps.focal_point.x
         || focal_point.y !== prevProps.focal_point.y
      if (update_counter_changed
         || scope_changed
         || focal_point_changed
         || in_wait_changed) {
         setTimeout(() => {
            this.decorate_canvas()
         }, 1000)
      }
   }

   visible_bailiwicks = () => {
      const {all_bailiwicks} = this.state
      const {scope, focal_point} = this.props
      const scope_by_two = scope / 2;
      return all_bailiwicks.filter(bailiwick => {
         const core_point = typeof bailiwick.core_point === 'string'
            ? JSON.parse(bailiwick.core_point)
            : bailiwick.core_point
         if (core_point.x < focal_point.x - scope_by_two) {
            return false;
         }
         if (core_point.x > focal_point.x + scope_by_two) {
            return false;
         }
         if (core_point.y < focal_point.y - scope_by_two) {
            return false;
         }
         if (core_point.y > focal_point.y + scope_by_two) {
            return false;
         }
         return true;
      })
   }

   decorate_canvas = () => {
      const {ctx, scope, focal_point} = this.props
      const visible_bailiwicks = this.visible_bailiwicks()
         .sort((a, b) => b.magnitude - a.magnitude)
         .slice(0, 25)
         .map(bailiwick => typeof bailiwick.core_point === 'string'
            ? JSON.parse(bailiwick.core_point) : bailiwick.core_point)
      this.setState({visible_bailiwicks: visible_bailiwicks})
      FractoCanvasOverlay.render_highlights(ctx, focal_point, scope, visible_bailiwicks)
   }

   fetch_bailiwicks = () => {
      const {ordering} = this.state
      const {ctx} = this.props
      BailiwickData.fetch_bailiwicks(all_bailiwicks => {
         const canvas = ctx.canvas
         const canvas_bounds = canvas.getBoundingClientRect()
         const sorted = all_bailiwicks.filter(b => !b.is_node)
         this.setState({
            all_bailiwicks: sorted,
            canvas_bounds: canvas_bounds
         })
         setTimeout(() => {
            this.on_change_ordering(ordering)
            this.decorate_canvas()
         }, 100)
      })
   }

   update_display = (focal_point, scope) => {
      const {on_focal_point_changed, on_scope_changed} = this.props
      on_focal_point_changed(focal_point)
      on_scope_changed(scope)
      const interval = setInterval(() => {
         if (!this.props.in_wait) {
            on_scope_changed(scope)
            clearInterval(interval)
         }
      }, 100)
   }

   select_bailiwick = (bailiwick, select_index) => {
      localStorage.setItem(SELECTED_BAILIWICK_KEY, `${bailiwick.id}`)
      this.setState({
         bailiwick: bailiwick,
         select_index: select_index
      })
      const display_settings = typeof bailiwick.display_settings === 'string'
         ? JSON.parse(bailiwick.display_settings) : bailiwick.display_settings
      this.update_display(display_settings.focal_point, display_settings.scope)
   }

   find_octave_point = (core_point, candidates) => {
      const {scope} = this.props
      for (let i = 0; i < candidates.length; i++) {
         const candidate = candidates[i]
         const x_offset = core_point.x - candidate.x
         const y_offset = core_point.y - candidate.y
         const distance = Math.sqrt(x_offset * x_offset + y_offset * y_offset)
         if (distance > scope / 5) {
            return candidate;
         }
      }
      return null;
   }

   find_bailiwick = () => {
      const {canvas_buffer, focal_point, scope} = this.props
      const increment = scope / canvas_buffer.length;
      const leftmost = focal_point.x - scope / 2
      const topmost = focal_point.y + scope / 2
      const best_patterns = []
      for (let img_x = 1; img_x < canvas_buffer.length - 1; img_x++) {
         const x = leftmost + increment * img_x
         for (let img_y = 1; img_y < canvas_buffer[img_x].length - 1; img_y++) {
            const y = topmost - increment * img_y
            const [pattern, iteration] = canvas_buffer[img_x][img_y]
            if (pattern <= 1) {
               continue;
            }
            let perimeter = 0
            for (let i = -1; i <= 1; i++) {
               // const x_per = leftmost + increment * (img_x + i)
               for (let j = -1; j <= 1; j++) {
                  if (!i && !j) {
                     continue;
                  }
                  // const y_per = topmost - increment * (img_y + j)
                  let [pat, iter] = canvas_buffer[img_x + i][img_y + j]
                  perimeter += iter
               }
            }
            let pattern_bin = best_patterns.find(bin => bin.pattern === pattern)
            if (!pattern_bin) {
               pattern_bin = {
                  pattern: pattern, points: []
               }
               best_patterns.push(pattern_bin)
            }
            pattern_bin.points.push({x: x, y: y, perimeter: perimeter})
         }
      }
      const result = best_patterns
         .sort((a, b) => a.pattern - b.pattern)
      result.forEach(r => {
         r.points = r.points.sort((a, b) => a.perimeter - b.perimeter)
      })
      console.log('result', result)
      const core_point = best_patterns[0].points[0]
      const octave_point = this.find_octave_point(core_point, best_patterns[1].points)
      const pattern = best_patterns[0].pattern
      return [core_point, octave_point, pattern]
   }

   save_bailiwick = (core_point, octave_point, pattern, id = 0) => {
      const x_diff = core_point.x - octave_point.x
      const y_diff = core_point.y - octave_point.y
      const magnitude = Math.sqrt(x_diff * x_diff + y_diff * y_diff)
      const cq_code = FractoUtil.CQ_code_from_point(core_point.x, core_point.y)
      const new_bailiwick = {
         pattern: pattern,
         magnitude: magnitude,
         core_point: {x: core_point.x, y: core_point.y},
         octave_point: {x: octave_point.x, y: octave_point.y},
         display_settings: {
            focal_point: {
               x: (core_point.x + octave_point.x) / 2,
               y: (core_point.y + octave_point.y) / 2
            },
            scope: magnitude * 3
         },
         CQ_code: cq_code.slice(0, 25),
      }
      if (id) {
         new_bailiwick.id = id
      }
      this.update_display(new_bailiwick.display_settings.focal_point,
         new_bailiwick.display_settings.scope)
      BailiwickData.save_bailiwick(new_bailiwick, 0, result => {
         console.log("BailiwickData.save_bailiwick", result)
      })
   }

   add_bailiwick = () => {
      const {ctx, focal_point, scope} = this.props
      const [core_point, octave_point, pattern] = this.find_bailiwick()
      FractoCanvasOverlay.render_highlights(
         ctx, focal_point, scope, [core_point, octave_point])
      this.save_bailiwick(core_point, octave_point, pattern)
   }

   refine_bailiwick = (bailiwick) => {
      const [core_point, octave_point, pattern] = this.find_bailiwick()
      console.log('bailiwick', bailiwick, core_point, octave_point, pattern)
      this.save_bailiwick(core_point, octave_point, pattern, bailiwick.id)
   }

   maximize_bailiwick = (bailiwick) => {
      const {scope, focal_point, on_scope_changed, on_focal_point_changed, canvas_buffer} = this.props
      const display_settings = typeof bailiwick.display_settings == 'string'
         ? JSON.parse(bailiwick.display_settings) : bailiwick.display_settings
      const increment = scope / INSPECTOR_SIZE_PX
      const image_leftmost = focal_point.x - scope / 2
      const focal_image_x = Math.floor((display_settings.focal_point.x - image_leftmost) / increment)
      let leftmost_bailiwick = display_settings.focal_point.x
      for (let margin_left = focal_image_x; margin_left > 0; margin_left--) {
         let empty_column = true
         leftmost_bailiwick -= increment
         for (let img_y = 0; img_y < INSPECTOR_SIZE_PX; img_y++) {
            const [pattern, increment] = canvas_buffer[margin_left][img_y]
            if (pattern) {
               empty_column = false
               break;
            }
         }
         if (empty_column) {
            break;
         }
      }
      let rightmost_bailiwick = display_settings.focal_point.x
      for (let margin_right = focal_image_x; margin_right < INSPECTOR_SIZE_PX; margin_right++) {
         let empty_column = true
         rightmost_bailiwick += increment
         for (let img_y = 0; img_y < INSPECTOR_SIZE_PX; img_y++) {
            const [pattern, increment] = canvas_buffer[margin_right][img_y]
            if (pattern) {
               empty_column = false
               break;
            }
         }
         if (empty_column) {
            break;
         }
      }
      const image_topmost = focal_point.y + scope / 2
      const focal_image_y = Math.floor((image_topmost - display_settings.focal_point.y) / increment)
      let topmost_bailiwick = display_settings.focal_point.y
      for (let margin_top = focal_image_y; margin_top > 0; margin_top--) {
         let empty_row = true
         topmost_bailiwick += increment
         for (let img_x = 0; img_x < INSPECTOR_SIZE_PX; img_x++) {
            const [pattern, increment] = canvas_buffer[img_x][margin_top]
            if (pattern) {
               empty_row = false
               break;
            }
         }
         if (empty_row) {
            break;
         }
      }
      let bottommost_bailiwick = display_settings.focal_point.y
      for (let margin_bottom = focal_image_y; margin_bottom < INSPECTOR_SIZE_PX; margin_bottom++) {
         let empty_row = true
         bottommost_bailiwick -= increment
         for (let img_x = 0; img_x < INSPECTOR_SIZE_PX; img_x++) {
            const [pattern, increment] = canvas_buffer[img_x][margin_bottom]
            if (pattern) {
               empty_row = false
               break;
            }
         }
         if (empty_row) {
            break;
         }
      }
      const new_width = rightmost_bailiwick - leftmost_bailiwick
      const new_height = topmost_bailiwick - bottommost_bailiwick
      this.update_display({
         x: leftmost_bailiwick + new_width / 2,
         y: topmost_bailiwick - new_height / 2
      }, new_width > new_height ? new_width : new_height)
   }

   on_change_ordering = (ordering) => {
      const {all_bailiwicks} = this.state
      const sorted = order_bailiwicks(all_bailiwicks, ordering)
      localStorage.setItem(LS_BAILIWICK_ORDERING_KEY, ordering)
      this.setState({
         ordering,
         all_bailiwicks: sorted
      })
   }

   export_now = () => {
      const {all_bailiwicks} = this.state
      const url = `${network["fracto-prod"]}/json_to_manifest.php?filename=all_bailiwicks.json`
      console.log('export_now', url)
      axios.post(url, JSON.stringify(all_bailiwicks), {
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Access-Control-*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
         },
         mode: 'no-cors',
         crossdomain: true,
      })
   }

   on_list_all = () => {
      const {ordering, list_all} = this.state
      this.setState({list_all: !list_all})
      this.on_change_ordering(ordering)
   }

   set_published = () => {
      const {is_published, ordering} = this.state
      this.setState({is_published: !is_published})
      this.on_change_ordering(ordering)
   }

   render() {
      const {is_published, all_bailiwicks, list_all, ordering, select_index} = this.state
      const {in_wait, width_px} = this.props
      const add_bailiwick = <CoolStyles.LinkSpan
         onClick={this.add_bailiwick}>
         {'add bailiwick'}
      </CoolStyles.LinkSpan>
      const export_now = <styles.ExportButton
         onClick={this.export_now}>
         {'export now'}
      </styles.ExportButton>
      const list_all_link = <CoolStyles.LinkSpan
         onClick={e => this.on_list_all()}>
         {list_all ? 'list visible' : 'list all'}
      </CoolStyles.LinkSpan>
      const refresh_link = <CoolStyles.LinkSpan onClick={this.fetch_bailiwicks}>
         {'refresh'}
      </CoolStyles.LinkSpan>
      const published_list = all_bailiwicks.filter(b => is_published ? b.published_at : !b.published_at)
      const bailiwicks_list = list_all ? published_list : this.visible_bailiwicks()
      const refine_link = bailiwicks_list.length === 1 ? <CoolStyles.LinkSpan
         onClick={e => this.refine_bailiwick(bailiwicks_list[0])}>
         {'refine'}
      </CoolStyles.LinkSpan> : []
      const maximize_link = bailiwicks_list.length === 1 ? <CoolStyles.LinkSpan
         onClick={e => this.maximize_bailiwick(bailiwicks_list[0])}>
         {'maximize'}
      </CoolStyles.LinkSpan> : []
      const sorting_options = <CoolSelect
         options={ordering_options}
         value={ordering}
         on_change={e => this.on_change_ordering(e.target.value)}
      />
      const published = [
         <styles.CheckboxWrapper
            onClick={this.set_published}
            key={`checkbox-inline`}>
            <input
               type={"checkbox"}
               name={`checkbox-inline`}
               checked={is_published ? 1 : 0}
            />
         </styles.CheckboxWrapper>,
         <styles.CheckboxLabel
            onClick={this.set_inline}
            key={`label-inline`}>
            {`published`}
         </styles.CheckboxLabel>,
      ]
      const controls = [
         list_all_link, <Spacer/>,
         refresh_link, <Spacer/>,
         refine_link, <Spacer/>,
         maximize_link, <Spacer/>,
         sorting_options, <Spacer/>,
         published, <Spacer/>,
         add_bailiwick, <Spacer/>,
         export_now, <Spacer/>,
      ]
      return <ContentWrapper>
         <ControlsWrapper>
            {controls}
         </ControlsWrapper>
         <SelectWrapper style={{width: width_px - 20}}>
            <BailiwickList
               bailiwick_list={bailiwicks_list}
               on_select={this.select_bailiwick}
               in_wait={in_wait}
               selected_index={select_index}
            />
         </SelectWrapper>
      </ContentWrapper>
   }
}

export default TabBailiwicks;
