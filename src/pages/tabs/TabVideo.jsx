import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolButton, CoolStyles, CoolTable} from "common/ui/CoolImports";
import {CELL_ALIGN_CENTER, CELL_TYPE_NUMBER, TABLE_CAN_SELECT} from "../../common/ui/CoolTable";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
   text-align: left;
`

const PATH_STEPS_COLUMNS = [
   {
      id: "step_index",
      label: "#",
      type: CELL_TYPE_NUMBER,
      width_px: 20,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "focal_point_x",
      label: "X",
      type: CELL_TYPE_NUMBER,
      width_px: 180,
   },
   {
      id: "focal_point_y",
      label: "Y",
      type: CELL_TYPE_NUMBER,
      width_px: 180,
   },
   {
      id: "scope",
      label: "scope",
      type: CELL_TYPE_NUMBER,
      width_px: 180,
   },
]

export class TabVideo extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      path_steps: [],
      step_index: 0
   }

   add_to_path = () => {
      const {path_steps} = this.state
      const {focal_point, scope} = this.props
      path_steps.push({focal_point, scope})
      this.setState({path_steps})
   }

   select_step = (index) => {
      const {path_steps} = this.state
      const {on_focal_point_changed, on_scope_changed} = this.props
      on_focal_point_changed({
         x: path_steps[index].focal_point_x,
         y: path_steps[index].focal_point_y,
      })
      setTimeout(() => {
         on_scope_changed(path_steps[index].scope)
         this.setState({
            step_index: index
         })
      }, 100)
   }

   render() {
      const {path_steps, step_index} = this.state
      const start_button = <CoolButton
         on_click={this.add_to_path}
         content={path_steps.length ? 'Add to Path' : 'Start Path'}
         disabled={false}
         primary={true}
      />
      const path_steps_data = path_steps.map((step, i) => {
         return {
            step_index: i + 1,
            focal_point_x: step.focal_point.x,
            focal_point_y: step.focal_point.y,
            scope: step.scope,
         }
      })
      const path_steps_table = !path_steps.length ? [] : <CoolTable
         data={path_steps_data}
         columns={PATH_STEPS_COLUMNS}
         options={TABLE_CAN_SELECT}
         selected_row={step_index}
         on_select_row={this.select_step}
      />
      return <ContentWrapper>
         {start_button}
         {path_steps_table}
      </ContentWrapper>
   }
}

export default TabVideo;
