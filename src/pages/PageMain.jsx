import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppPageMain from 'common/app/AppPageMain';
import {CoolStyles} from 'common/ui/CoolImports';

import FractoRenderDetails from "fracto/common/render/FractoRenderDetails"
import FractoLevelSlider from "fracto/common/render/FractoLevelSlider";

import InspectorStrata from "./Inspector/InspectorStrata"
import InspectorRaster from "./Inspector/InspectorRaster";
import InspectorTabs from "./Inspector/InspectorTabs";

const INSPECTOR_PADDING_PX = 5

const STORAGE_FOCAL_POINT_KEY = "inspector_focal_point"
const STORAGE_SCOPE_KEY = "inspector_scope"
export const OPTION_SHOW_BAILIWICKS = "show_bailiwicks"

const InspectorWrapper = styled(CoolStyles.InlineBlock)`
   height: 100%;
   margin-left: ${2 * INSPECTOR_PADDING_PX}px;
   margin-right: ${INSPECTOR_PADDING_PX}px;
   margin-top: ${2 * INSPECTOR_PADDING_PX}px;
   background-color: light-grey;
`;

const SliderWrapper = styled(CoolStyles.InlineBlock)`
   height: 100%;
   margin-left: ${INSPECTOR_PADDING_PX}px;
   margin-top: ${2 * INSPECTOR_PADDING_PX}px;
`;

const DetailsWrapper = styled(CoolStyles.Block)`
   margin-top: ${2 * INSPECTOR_PADDING_PX}px;
   margin-bottom: 0.5rem;
   background-color: white;
   overflow-x: hidden;
   padding: 0.5rem;
   border: 0.125rem solid #888888;
   border-radius: 0.25rem;
`;

export class PageMain extends Component {

   static propTypes = {
      app_name: PropTypes.string.isRequired,
   }

   state = {
      left_width: 0,
      right_width: 0,
      focal_point: {x: -0.75, y: 0.25},
      scope: 2.5,
      inspector_ready: true,
      hover_point: {x: 0, y: 0},
      in_hover: false,
      update_counter: 0,
      canvas_buffer: [],
      ctx: null,
      options: {},
      highest_level: 0,
      effects_func: null,
      in_navlock: false,
      click_point: {}
   };

   static inspector_ref = React.createRef()

   componentDidMount() {
      const recent_focal_point = localStorage.getItem(STORAGE_FOCAL_POINT_KEY)
      if (recent_focal_point) {
         this.set_focal_point(JSON.parse(recent_focal_point))
      }
      // const recent_scope = localStorage.getItem(STORAGE_SCOPE_KEY)
      // if (recent_scope) {
      //    this.set_scope(parseFloat(recent_scope))
      // }
   }

   on_resize = (left_width, right_width) => {
      console.log("on_resize", left_width, right_width)
      this.setState({
         left_width: left_width,
         right_width: right_width
      })
   }

   get_canvas_size_px = () => {
      const container = PageMain.inspector_ref.current
      if (container) {
         const container_bounds = container.getBoundingClientRect()
         const canvas_size = Math.round(container_bounds.height - 2 * INSPECTOR_PADDING_PX)
         return canvas_size - 20;
      }
      return 1;
   }

   on_hover = (location) => {
      if (!location) {
         this.setState({
            in_hover: false
         })
      } else {
         this.setState({
            hover_point: location,
            in_hover: true
         })
      }
   }

   on_plan_complete = (canvas_buffer, ctx) => {
      const {update_counter} = this.state
      this.setState({
         canvas_buffer: canvas_buffer,
         ctx: ctx,
         inspector_ready: true,
         update_counter: update_counter + 1
      })
   }

   render_inspection = (width_px) => {
      const {focal_point, scope, options, effects_func} = this.state
      const canvas_size_px = this.get_canvas_size_px()
      return <InspectorWrapper
         ref={PageMain.inspector_ref}>
         <InspectorRaster
            width_px={canvas_size_px}
            focal_point={focal_point}
            scope={scope}
            options={options}
            effects_func={effects_func}
            on_focal_point_change={this.set_focal_point}
            on_hover={location => this.on_hover(location)}
            on_plan_complete={this.on_plan_complete}
         />
      </InspectorWrapper>
   }

   set_focal_point = (focal_point) => {
      // const {in_navlock} = this.state
      // if (in_navlock) {
      //    this.setState({click_point: focal_point})
      //    return;
      // }
      localStorage.setItem(STORAGE_FOCAL_POINT_KEY, JSON.stringify(focal_point))
      this.setState({
         focal_point: focal_point,
         inspector_ready: false,
      })
   }

   set_scope = (scope) => {
      // const {in_navlock} = this.state
      // if (in_navlock) {
      //    return;
      // }
      localStorage.setItem(STORAGE_SCOPE_KEY, `${scope}`)
      const level = Math.round(100 * (Math.log(32 / scope) / Math.log(2))) / 100
      this.setState({
         scope: scope,
         highest_level: level,
         inspector_ready: false,
      })
   }

   set_level = (level) => {
      // const {in_navlock} = this.state
      // if (in_navlock) {
      //    return;
      // }
      const scope = Math.pow(2, 5 - level)
      this.setState({
         scope: scope,
         highest_level: level,
         inspector_ready: false,
      })
   }

   set_navlock_changed = () => {
      const {in_navlock} = this.state
      this.setState({in_navlock: !in_navlock})
   }

   render() {
      const {
         left_width, right_width, focal_point, inspector_ready, highest_level,
         hover_point, scope, in_hover, update_counter, canvas_buffer, ctx, in_navlock, click_point
      } = this.state;
      const {app_name} = this.props;
      const left_side = <InspectorStrata
         width_px={left_width}
         scope={scope}
         focal_point={focal_point}
         on_scope_changed={this.set_scope}
         on_focal_point_changed={this.set_focal_point}
         update_counter={update_counter}
         disabled={!inspector_ready}
      />
      const canvas_size_px = this.get_canvas_size_px()
      const details_width_px = right_width - canvas_size_px - INSPECTOR_PADDING_PX * 15
      const render_details = <DetailsWrapper>
         <FractoRenderDetails
            width_px={details_width_px}
            scope={scope}
            focal_point={focal_point}
            on_scope_changed={this.set_scope}
            on_focal_point_changed={this.set_focal_point}
            cursor_point={in_hover ? hover_point : null}
         />
      </DetailsWrapper>
      const inspector_tabs = <InspectorTabs
         width_px={details_width_px - INSPECTOR_PADDING_PX * 2}
         scope={scope}
         focal_point={focal_point}
         on_scope_changed={this.set_scope}
         on_focal_point_changed={this.set_focal_point}
         canvas_buffer={canvas_buffer}
         ctx={ctx}
         update_counter={update_counter}
         in_wait={!inspector_ready}
         in_navlock={in_navlock}
         on_navlock_changed={this.set_navlock_changed}
         click_point={click_point}
      />
      const level_slider = <SliderWrapper>
         <FractoLevelSlider
            selected_level={highest_level}
            on_change={value => this.set_level(value)}
            height_px={canvas_size_px - INSPECTOR_PADDING_PX * 2}
            in_wait={!inspector_ready}
         />
      </SliderWrapper>
      const details_style = {
         width: `${details_width_px}px`,
         marginLeft: "0.5rem"
      }
      const right_side = [
         this.render_inspection(right_width),
         level_slider,
         <CoolStyles.InlineBlock
            style={details_style}>
            {render_details}
            {inspector_tabs}
         </CoolStyles.InlineBlock>
      ]
      return <AppPageMain
         app_name={app_name}
         on_resize={(left_width, right_width) => this.on_resize(left_width, right_width)}
         content_left={left_side}
         content_right={right_side}
      />
   }
}

export default PageMain;
