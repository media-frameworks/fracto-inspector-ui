import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import {get_ideal_level} from "fracto/common/data/FractoData";
import FractoIncrementalRender from "fracto/common/render/FractoIncrementalRender";

import {OPTION_SHOW_BAILIWICKS} from "../PageMain";
import {INSPECTOR_SIZE_PX} from "../constants";

const InspectorWrapper = styled(CoolStyles.InlineBlock)`
   height: 99%;
`;

export class InspectorRaster extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      options: PropTypes.object.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_change: PropTypes.func.isRequired,
      on_plan_complete: PropTypes.func.isRequired,
      on_hover: PropTypes.func.isRequired,
      disabled: PropTypes.bool.isRequired,
   }

   state = {
      all_bailiwicks: [],
      canvas_buffer: []
   };

   static inspector_ref = React.createRef()

   get_mouse_pos = (e) => {
      const {focal_point, scope} = this.props
      const inspector_bounds = {
         left: focal_point.x - scope / 2,
         top: focal_point.y + scope / 2,
      }
      const inspector_wrapper = InspectorRaster.inspector_ref.current
      if (!inspector_wrapper) {
         return {}
      }
      const bounds = inspector_wrapper.getBoundingClientRect()
      const increment = scope / INSPECTOR_SIZE_PX
      const x = inspector_bounds.left + increment * (e.clientX - bounds.x)
      const y = inspector_bounds.top - increment * (e.clientY - bounds.y)
      return {x: x, y: y}
   }

   on_mousemove = (e) => {
      const {on_hover} = this.props
      const location = this.get_mouse_pos(e)
      on_hover(location)
   }

   on_mouseleave = (e) => {
      const {on_hover} = this.props
      on_hover(false)
   }

   on_click = (e) => {
      const {focal_point, scope, on_focal_point_change, disabled} = this.props
      if (disabled) {
         return
      }
      const container_bounds = InspectorRaster.inspector_ref.current.getBoundingClientRect()
      const img_x = Math.floor(e.clientX - container_bounds.left)
      const img_y = Math.floor(e.clientY - container_bounds.top)
      const leftmost = focal_point.x - scope / 2
      const topmost = focal_point.y + scope / 2
      const increment = scope / container_bounds.width
      on_focal_point_change({
         x: leftmost + increment * img_x,
         y: topmost - increment * img_y,
      })
   }

   on_plan_complete = (canvas_buffer, ctx) => {
      const {on_plan_complete} =this.props
      on_plan_complete(canvas_buffer, ctx)
   }

   render() {
      const {all_bailiwicks} = this.state
      const {focal_point, scope, options, disabled} = this.props
      const ideal_level = get_ideal_level(INSPECTOR_SIZE_PX, scope, 1.5)
      const visible_bailiwicks = !options[OPTION_SHOW_BAILIWICKS] ? [] : all_bailiwicks.filter(bailiwick => {
         const core_point = JSON.parse(bailiwick.core_point)
         if (core_point.x < focal_point.x - scope / 2) {
            return false;
         }
         if (core_point.x > focal_point.x + scope / 2) {
            return false;
         }
         if (core_point.y < focal_point.y - scope / 2) {
            return false;
         }
         if (core_point.y > focal_point.y + scope / 2) {
            return false;
         }
         return true;
      })
      // console.log ("visible_bailiwicks", visible_bailiwicks)
      const highlight_points = visible_bailiwicks.map(bailiwick => {
         let highlight_data = JSON.parse(bailiwick.core_point)
         highlight_data.label = `${bailiwick.name} (#${bailiwick.free_ordinal})`
         highlight_data.box_count = 3;
         if (bailiwick.magnitude < scope / 80) {
            highlight_data.box_count = 2;
         }
         if (bailiwick.magnitude < scope / 320) {
            highlight_data.box_count = 1;
         }
         return highlight_data
      })
      return <InspectorWrapper
         ref={InspectorRaster.inspector_ref}
         onClick={this.on_click}
         onMouseMove={this.on_mousemove}
         onMouseLeave={this.on_mouseleave}>
         <FractoIncrementalRender
            key={'inspection_raster'}
            width_px={INSPECTOR_SIZE_PX}
            scope={scope}
            focal_point={focal_point}
            level={ideal_level}
            on_plan_complete={this.on_plan_complete}
            highlight_points={highlight_points}
            incremental_depth={2}
            disabled={disabled}
         />
      </InspectorWrapper>
   }
}

export default InspectorRaster;
