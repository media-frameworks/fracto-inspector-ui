import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppPageMain from 'common/app/AppPageMain';
import {CoolStyles, CoolTabs} from 'common/ui/CoolImports';
import {DEFAULT_HOLODECK} from "common/threed/holodeck/HolodeckController";

import FractoRenderDetails from "../fracto/common/render/FractoRenderDetails"
import InspectorStrata from "./Inspector/InspectorStrata"
import InspectorBailiwicks from "./Inspector/InspectorBailiwicks"
import InspectorBurrows from "./Inspector/InspectorBurrows"
import InspectorFreeform from "./Inspector/InspectorFreeform"
import InspectorRaster from "./Inspector/InspectorRaster";
import Inspector3D from "./Inspector/Inspector3D";
import FractoOrbitalsList from "../fracto/common/render/FractoOrbitalsList";

const INSPECTOR_PADDING_PX = 10
const CONTROLS_STORAGE_KEY = 'HOLODECK_CONTROLS'

const STORAGE_FOCAL_POINT_KEY = "inspector_focal_point"
const STORAGE_SCOPE_KEY = "inspector_scope"

const TAB_LABEL_FREEFORM = "freeform"
const TAB_LABEL_BAILIWICKS = "bailiwicks"
const TAB_LABEL_BUTRROWS = "burrows";
const TAB_LABEL_ORBITALS = "orbitals";
const TABS_LIST = [
   TAB_LABEL_FREEFORM,
   TAB_LABEL_BAILIWICKS,
   TAB_LABEL_BUTRROWS,
   TAB_LABEL_ORBITALS
]
export const OPTION_SHOW_BAILIWICKS = "show_bailiwicks"
export const OPTION_VIEW_3D = "view_3d"

const InspectorWrapper = styled(CoolStyles.InlineBlock)`
   height: 100%;
   margin-left: ${10}px;
   margin-top: ${10}px;
   background-color: light-grey;
`;

const DetailsWrapper = styled(CoolStyles.Block)`
   margin: ${10}px;
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
      tab_index: 0,
      options: {},
      update_counter: 0,
      canvas_buffer: []
   };

   static inspector_ref = React.createRef()

   componentDidMount() {
      const {options} = this.state

      const controls = localStorage.getItem(CONTROLS_STORAGE_KEY)
      options.holodeck_controls = controls ? JSON.parse(controls) : DEFAULT_HOLODECK
      // options.holodeck_controls =  DEFAULT_HOLODECK
      this.setState({options: options})

      const recent_focal_point = localStorage.getItem(STORAGE_FOCAL_POINT_KEY)
      if (recent_focal_point) {
         this.setState({focal_point: JSON.parse(recent_focal_point)})
      }
      const recent_scope = localStorage.getItem(STORAGE_SCOPE_KEY)
      if (recent_scope) {
         this.setState({scope: parseFloat(recent_scope)})
      }
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

   on_controls_change = (controls) => {
      const {options, update_counter, inspector_ready} = this.state
      if (!inspector_ready) {
         return;
      }
      let new_options = JSON.parse(JSON.stringify(options))
      new_options.holodeck_controls = JSON.parse(JSON.stringify(controls))
      localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(controls))
      console.log("new_options", new_options)

      this.setState({
         options: new_options,
         update_counter: update_counter + 1,
         // inspector_ready: false,
      })
   }

   on_plan_complete = (canvas_buffer) => {
      const {update_counter} = this.state
      this.setState({
         canvas_buffer: canvas_buffer,
         inspector_ready: true,
         update_counter: update_counter + 1
      })
   }

   render_inspection = (width_px) => {
      const {focal_point, scope, options, update_counter} = this.state
      const canvas_size_px = this.get_canvas_size_px()
      if (!options[OPTION_VIEW_3D]) {
         return <InspectorWrapper
            ref={PageMain.inspector_ref}>
            <InspectorRaster
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               options={options}
               on_focal_point_change={focal_point => this.setState({focal_point: focal_point})}
               on_hover={location => this.on_hover(location)}
               on_plan_complete={this.on_plan_complete}
            />
         </InspectorWrapper>
      } else {
         return <InspectorWrapper
            ref={PageMain.inspector_ref}>
            <Inspector3D
               canvas_size_px={canvas_size_px}
               update_counter={update_counter}
               holodeck_controls={options.holodeck_controls}
               on_controls_change={controls => this.on_controls_change(controls)}
               on_plan_complete={ref => this.setState({inspector_ready: true})}
            />
         </InspectorWrapper>
      }
   }

   on_options_changed = (options) => {
      const {update_counter, inspector_ready} = this.state
      if (!inspector_ready) {
         return;
      }
      let new_options = JSON.parse(JSON.stringify(options))
      this.setState({
         options: new_options,
         update_counter: update_counter + 1
      })
   }

   render_tabs = (details_width_px) => {
      const {tab_index, options, canvas_buffer, update_counter} = this.state
      let content = `you have selected ${tab_index}`
      switch (tab_index) {
         case 0:
            content = <InspectorFreeform
               width_px={details_width_px}
               options={options}
               set_options={options => this.on_options_changed(options)}
               on_update_controls={this.on_controls_change}
               // set_options={options => console.log("options", options)}
            />
            break;
         case 1:
            content = <InspectorBailiwicks
               width_px={details_width_px}
               on_focal_point_changed={focal_point => this.set_focal_point(focal_point)}
               on_scope_changed={scope => this.set_scope(scope)}
            />
            break;
         case 2:
            content = <InspectorBurrows
               width_px={details_width_px}
               on_focal_point_changed={focal_point => this.set_focal_point(focal_point)}
               on_scope_changed={scope => this.set_scope(scope)}
            />
            break;
         case 3:
            content = <FractoOrbitalsList
               width_px={details_width_px}
               canvas_buffer={canvas_buffer}
               update_counter={update_counter}
            />
            break;
         default:
            break;
      }
      return <CoolTabs
         width_px={details_width_px - 2 * INSPECTOR_PADDING_PX}
         labels={TABS_LIST}
         on_tab_select={tab_index => this.setState({tab_index: tab_index})}
         selected_content={content}
         tab_index={tab_index}
         style={{
            marginLeft: `${INSPECTOR_PADDING_PX}px`,
            maxWidth: `${details_width_px - INSPECTOR_PADDING_PX}px`
         }}
      />
   }

   set_focal_point = (focal_point) => {
      const {options} = this.state
      let new_options = JSON.parse(JSON.stringify(options))
      new_options.holodeck_controls.focal_x = focal_point.x
      new_options.holodeck_controls.focal_y = focal_point.y
      localStorage.setItem(STORAGE_FOCAL_POINT_KEY, JSON.stringify(focal_point))
      this.setState({
         focal_point: focal_point,
         options: new_options,
         inspector_ready: false
      })
   }

   set_scope = (scope) => {
      console.log("set_scope", scope)
      localStorage.setItem(STORAGE_SCOPE_KEY, `${scope / 5}`)
      this.setState({
         scope: scope,
         inspector_ready: false
      })
   }

   render() {
      const {
         left_width, right_width, focal_point,
         hover_point, scope, in_hover
      } = this.state;
      const {app_name} = this.props;
      const left_side = <InspectorStrata
         width_px={left_width}
         focal_point={focal_point}
         disabled={false}
         on_focal_point_changed={focal_point => this.set_focal_point(focal_point)}
         on_scope_changed={scope => this.set_scope(scope / 5)}
      />
      const canvas_size_px = this.get_canvas_size_px()
      const details_width_px = right_width - canvas_size_px - INSPECTOR_PADDING_PX * 3 - 10
      const inspector_tabs = this.render_tabs(details_width_px - INSPECTOR_PADDING_PX * 2)
      const details_style = {width: `${details_width_px}px`}
      const right_side = [
         this.render_inspection(right_width),
         <CoolStyles.InlineBlock
            style={details_style}>
            <DetailsWrapper>
               <FractoRenderDetails
                  width_px={details_width_px}
                  focal_point={focal_point}
                  scope={scope}
                  cursor_point={in_hover ? hover_point : null}
                  on_focal_point_changed={focal_point => this.setState({
                     focal_point: focal_point,
                     inspector_ready: false
                  })}
                  on_scope_changed={this.set_scope}
               />
            </DetailsWrapper>
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
