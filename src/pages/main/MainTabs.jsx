import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

import {CoolTabs} from "../../common/ui/CoolImports";

import FractoOrbitalsList from "fracto/common/ui/FractoOrbitalsList";

import TabBailiwicks from "../tabs/TabBailiwicks"
import TabCoverage from "../tabs/TabCoverage"
import TabTransit from "../tabs/TabTransit";
import TabPatterns from "../tabs/TabPatterns";
import TabBurrows from "../tabs/TabBurrows";

const TAB_LABEL_TRANSIT = "transit";
const TAB_LABEL_ORBITALS = "orbitals";
const TAB_LABEL_BAILIWICKS = "bailiwicks"
const TAB_LABEL_COVERAGE = "coverage";
const TAB_LABEL_PATTERNS = "patterns";
const TAB_LABEL_BURROWS = "burrows";
const TABS_LIST = [
   TAB_LABEL_TRANSIT,
   TAB_LABEL_ORBITALS,
   TAB_LABEL_COVERAGE,
   TAB_LABEL_PATTERNS,
   TAB_LABEL_BAILIWICKS,
   TAB_LABEL_BURROWS,
]
const TAB_INDEX_TRANSIT = 0
const TAB_INDEX_ORBITALS = 1
const TAB_INDEX_COVERAGE = 2
const TAB_INDEX_PATTERNS = 3
const TAB_INDEX_BAILIWICKS = 4
const TAB_INDEX_BURROWS = 5

export class MainTabs extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      scope: PropTypes.number.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      focal_point: PropTypes.object.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      update_counter: PropTypes.number.isRequired,
      in_wait: PropTypes.bool.isRequired,
      canvas_buffer: PropTypes.array.isRequired,
      ctx: PropTypes.object.isRequired,
      click_point: PropTypes.object.isRequired,
      cursor_point: PropTypes.object,
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
      const {click_point, cursor_point} = this.props
      const {
         in_wait, focal_point, scope,
         width_px, canvas_buffer, ctx, update_counter,
         on_focal_point_changed, on_scope_changed,
      } = this.props
      let content = `you have selected ${tab_index}`
      switch (tab_index) {
         case TAB_INDEX_ORBITALS:
            content = canvas_buffer ? <FractoOrbitalsList
               width_px={width_px}
               canvas_buffer={canvas_buffer}
               update_counter={update_counter}
            /> : []
            break;
         case TAB_INDEX_COVERAGE:
            content = <TabCoverage
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               canvas_buffer={canvas_buffer}
               ctx={ctx}
            />
            break;
         case TAB_INDEX_PATTERNS:
            content = <TabPatterns
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               click_point={click_point}
               cursor_point={cursor_point}
            />
            break;
         case TAB_INDEX_BAILIWICKS:
            content = <TabBailiwicks
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
               update_counter={update_counter}
               canvas_buffer={canvas_buffer}
               ctx={ctx}
               in_wait={in_wait}
            />
            break;
         case TAB_INDEX_BURROWS:
            content = <TabBurrows
               width_px={width_px}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
            />
            break;
         case TAB_INDEX_TRANSIT:
            content = <TabTransit
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
               in_wait={in_wait}
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
            backgroundColor: 'rgba(0,0,0,0)'
         }}
      />
   }

}

export default MainTabs
