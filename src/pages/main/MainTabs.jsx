import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolTabs} from "../../common/ui/CoolImports";

import FractoOrbitalsList from "fracto/common/ui/FractoOrbitalsList";

import TabBailiwicks from "../tabs/TabBailiwicks"
import TabCoverage from "../tabs/TabCoverage"
import TabVideo from "../tabs/TabVideo";
import TabPatterns from "../tabs/TabPatterns";
import TabInventory from "../tabs/TabInventory";
import TabTest from "../tabs/TabTest";
import TabSearch from "../tabs/TabSearch";

const TAB_LABEL_MEDIA = "video";
const TAB_LABEL_ORBITALS = "orbitals";
const TAB_LABEL_BAILIWICKS = "bailiwicks"
const TAB_LABEL_COVERAGE = "coverage";
const TAB_LABEL_PATTERNS = "patterns";
const TAB_LABEL_INVENTORY = "inventory";
const TAB_LABEL_TEST = "test";
const TAB_LABEL_SEARCH = "search";
const TABS_LIST = [
   TAB_LABEL_ORBITALS,
   TAB_LABEL_COVERAGE,
   TAB_LABEL_PATTERNS,
   TAB_LABEL_BAILIWICKS,
   TAB_LABEL_MEDIA,
   TAB_LABEL_INVENTORY,
   TAB_LABEL_TEST,
   TAB_LABEL_SEARCH,
]
const TAB_INDEX_ORBITALS = 0
const TAB_INDEX_COVERAGE = 1
const TAB_INDEX_PATTERNS = 2
const TAB_INDEX_BAILIWICKS = 3
const TAB_INDEX_MEDIA = 4
const TAB_INDEX_INVENTORY = 5
const TAB_INDEX_TEST = 6
const TAB_INDEX_SEARCH = 7

const SelectedContentWrapper = styled(CoolStyles.InlineBlock)`
    overflow: auto;
`

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
      on_level_changed: PropTypes.func.isRequired,
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
      const {click_point, cursor_point, selected_level} = this.props
      const {
         in_wait, focal_point, scope,
         width_px, canvas_buffer, ctx, update_counter,
         on_focal_point_changed, on_scope_changed, on_level_changed
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
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
               on_level_selected={on_level_changed}
               selected_level={selected_level}
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
         case TAB_INDEX_INVENTORY:
            content = <TabInventory
               width_px={width_px}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
            />
            break;
         case TAB_INDEX_TEST:
            content = <TabTest
               width_px={width_px}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
            />
            break;
         case TAB_INDEX_SEARCH:
            content = <TabSearch
               width_px={width_px}
               focal_point={focal_point}
               scope={scope}
               on_focal_point_changed={on_focal_point_changed}
               on_scope_changed={on_scope_changed}
            />
            break;
         case TAB_INDEX_MEDIA:
            content = <TabVideo
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
      const selected_content = <SelectedContentWrapper>
         {content}
      </SelectedContentWrapper>
      return <CoolTabs
         width_px={width_px}
         labels={TABS_LIST}
         on_tab_select={tab_index => this.setState({tab_index: tab_index})}
         selected_content={selected_content}
         tab_index={tab_index}
         style={{
            maxWidth: `${width_px}px`,
            backgroundColor: 'rgba(0,0,0,0)'
         }}
      />
   }

}

export default MainTabs
