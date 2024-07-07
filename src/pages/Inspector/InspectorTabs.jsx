import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

import {CoolTabs} from "../../common/ui/CoolImports";

import FractoOrbitalsList from "fracto/common/ui/FractoOrbitalsList";
import FractoSequencePlanner from "fracto/FractoSequencePlanner";

import InspectorBailiwicks from "./InspectorBailiwicks"
import InspectorBurrows from "./InspectorBurrows"
import InspectorSound from "./InspectorSound"
import InspectorHarvest from "./InspectorHarvest";
import InspectorTest from "./InspectorTest";

const TAB_LABEL_ORBITALS = "orbitals";
const TAB_LABEL_SEQUENCES = "sequences";
const TAB_LABEL_BAILIWICKS = "bailiwicks"
const TAB_LABEL_BUTRROWS = "burrows";
// const TAB_LABEL_EFFECTS = "effects";
const TAB_LABEL_SOUND = "sound";
const TAB_LABEL_HARVEST = "harvest";
const TAB_LABEL_TEST = "test";
const TABS_LIST = [
   TAB_LABEL_HARVEST,
   TAB_LABEL_SOUND,
   TAB_LABEL_ORBITALS,
   TAB_LABEL_SEQUENCES,
   TAB_LABEL_BAILIWICKS,
   TAB_LABEL_BUTRROWS,
   TAB_LABEL_TEST,
]
const TAB_INDEX_HARVEST = 0
const TAB_INDEX_SOUND = 1
const TAB_INDEX_ORBITALS = 2
// const TAB_INDEX_EFFECTS = 1
const TAB_INDEX_SEQUENCES = 3
const TAB_INDEX_BAILIWICKS = 4
const TAB_INDEX_BUTRROWS = 5
const TAB_INDEX_TEST = 6

export class InspectorTabs extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      scope: PropTypes.number.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      focal_point: PropTypes.object.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      update_counter: PropTypes.number.isRequired,
      in_wait: PropTypes.bool.isRequired,
      canvas_buffer: PropTypes.array,
      ctx: PropTypes.object,
      on_navlock_changed: PropTypes.func,
      click_point: PropTypes.object
   }

   static defaultProps = {
      on_navlock_changed: null,
      click_point: {}
   }

   state = {
      tab_index: 0
   }

   render() {
      const {tab_index} = this.state
      const {on_navlock_changed, click_point} = this.props
      const {
         in_wait,
         focal_point, scope,
         width_px, canvas_buffer, ctx, update_counter,
         on_focal_point_changed, on_scope_changed,
      } = this.props
      let content = `you have selected ${tab_index}`
      switch (tab_index) {
         case TAB_INDEX_BAILIWICKS:
            content = <InspectorBailiwicks
               width_px={width_px}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
               in_wait={in_wait}
            />
            break;
         case TAB_INDEX_BUTRROWS:
            content = <InspectorBurrows
               width_px={width_px}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
            />
            break;
         case TAB_INDEX_ORBITALS:
            content = canvas_buffer ? <FractoOrbitalsList
               width_px={width_px}
               canvas_buffer={canvas_buffer}
               update_counter={update_counter}
            /> : []
            break;
         case TAB_INDEX_SEQUENCES:
            content = <FractoSequencePlanner
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
               in_wait={in_wait}
            />
            break;
         // caseTAB_INDEX_EFFECTS :
         //    content = <InspectorEffects
         //       width_px={width_px}
         //       canvas_buffer={canvas_buffer}
         //       ctx={ctx}
         //    />
         //    break;
         case TAB_INDEX_SOUND:
            content = canvas_buffer && ctx ? <InspectorSound
               width_px={width_px}
               canvas_buffer={canvas_buffer}
               ctx={ctx}
               click_point={click_point}
               on_navlock_changed={on_navlock_changed}
            /> : []
            break;
         case TAB_INDEX_HARVEST:
            content = <InspectorHarvest
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
            />
            break;
         case TAB_INDEX_TEST:
            content = <InspectorTest
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               click_point={click_point}
            />
            break;
         default:
            break;
      }
      return <CoolTabs
         width_px={width_px}
         labels={TABS_LIST}
         on_tab_select={tab_index => this.setState({tab_index: tab_index})}
         selected_content={content}
         tab_index={tab_index}
         style={{
            maxWidth: `${width_px}px`,
            backgroundColor: 'white'
         }}
      />
   }

}

export default InspectorTabs
