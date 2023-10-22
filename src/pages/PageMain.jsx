import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppPageMain from 'common/app/AppPageMain';
import {CoolStyles, CoolTabs} from 'common/ui/CoolImports';
import {DEFAULT_HOLODECK} from "common/threed/holodeck/HolodeckController";

import FractoCommon from "fracto/common/FractoCommon";
import FractoDataLoader from "fracto/common/data/FractoDataLoader";
import FractoData, {BIN_VERB_COMPLETED, BIN_VERB_INDEXED} from "fracto/common/data/FractoData";

import InspectorDetails from "./Inspector/InspectorDetails"
import InspectorStrata from "./Inspector/InspectorStrata"
import InspectorBailiwicks from "./Inspector/InspectorBailiwicks"
import InspectorBurrows from "./Inspector/InspectorBurrows"
import InspectorFreeform from "./Inspector/InspectorFreeform"
import InspectorRaster from "./Inspector/InspectorRaster";
import Inspector3D from "./Inspector/Inspector3D";

const INSPECTOR_PADDING_PX = 10

const STORAGE_FOCAL_POINT_KEY = "inspector_focal_point"
const STORAGE_SCOPE_KEY = "inspector_scope"

const TAB_LABEL_FREEFORM = "freeform"
const TAB_LABEL_BAILIWICKS = "bailiwicks"
const TAB_LABEL_BUTRROWS = "burrows";
const TABS_LIST = [
   TAB_LABEL_FREEFORM,
   TAB_LABEL_BAILIWICKS,
   TAB_LABEL_BUTRROWS,
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
      indexed_loading: true,
      completed_loading: true,
      focal_point: {x: -0.75, y: 0.25},
      scope: 2.5,
      inspector_ready: true,
      hover_point: {x: 0, y: 0},
      in_hover: false,
      tab_index: 0,
      options: {
         holodeck_controls: DEFAULT_HOLODECK
      },
      update_counter: 0
   };

   static inspector_ref = React.createRef()

   componentDidMount() {

      const recent_focal_point = localStorage.getItem(STORAGE_FOCAL_POINT_KEY)
      if (recent_focal_point) {
         this.setState({focal_point: JSON.parse(recent_focal_point)})
      }
      const recent_scope = localStorage.getItem(STORAGE_SCOPE_KEY)
      if (recent_scope) {
         this.setState({scope: parseFloat(recent_scope)})
      }
      FractoDataLoader.load_tile_set_async(BIN_VERB_INDEXED, result => {
         console.log("FractoDataLoader.load_tile_set_async", BIN_VERB_INDEXED, result)
         for (let level = 3; level <= 34; level++) {
            FractoData.get_cached_tiles(level, BIN_VERB_INDEXED)
         }
         this.setState({indexed_loading: false});
      });
      FractoDataLoader.load_tile_set_async(BIN_VERB_COMPLETED, result => {
         console.log("FractoDataLoader.load_tile_set_async", BIN_VERB_COMPLETED, result)
         for (let level = 3; level <= 34; level++) {
            FractoData.get_cached_tiles(level, BIN_VERB_COMPLETED)
         }
         this.setState({completed_loading: false});
      });
   }

   on_resize = (left_width, right_width) => {
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
      this.setState({
         options: new_options,
         update_counter: update_counter + 1,
         // inspector_ready: false,
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
      const {tab_index, options} = this.state
      let content = `you have selected ${tab_index}`
      switch (tab_index) {
         case 0:
            content = <InspectorFreeform
               width_px={details_width_px}
               options={options}
               set_options={options => this.on_options_changed(options)}
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
         left_width, right_width, indexed_loading, completed_loading, focal_point,
         hover_point, scope, in_hover
      } = this.state;
      const {app_name} = this.props;
      if (indexed_loading || completed_loading) {
         return FractoCommon.loading_wait_notice()
      }
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
      const details_style = {maxWidth: `${details_width_px}px`}
      const right_side = [
         this.render_inspection(right_width),
         <CoolStyles.InlineBlock
            style={details_style}>
            <DetailsWrapper>
               <InspectorDetails
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
