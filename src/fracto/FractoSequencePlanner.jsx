import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolSelect, CoolStyles, CoolButton, CoolTable} from "common/ui/CoolImports";
import SequenceData from "fracto/common/data/SequenceData"
import {
   CELL_ALIGN_CENTER,
   CELL_TYPE_CALLBACK,
   CELL_TYPE_NUMBER,
   TABLE_CAN_SELECT,
   CELL_ALIGN_LEFT
} from "../common/ui/CoolTable";
import {render_coordinates} from "./common/FractoStyles";

const LOCAL_STORAGE_KEY = "selected_sequence"

const BlockWrapper = styled(CoolStyles.Block)`
   margin: 0.5rem;
   background-color: white;
`

const InlineWrapper = styled(CoolStyles.InlineBlock)`
   margin: 0 0.5rem 0.5rem 0;
`

const STEP_LIST_COLUMNS = [
   {
      id: "step_index",
      label: "#",
      type: CELL_TYPE_NUMBER,
      width_px: 20,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "scope",
      label: "scope",
      type: CELL_TYPE_NUMBER,
      width_px: 120,
      align: CELL_ALIGN_LEFT
   },
   {
      id: "focal_point",
      label: "focal point",
      type: CELL_TYPE_CALLBACK,
      width_px: 400,
      align: CELL_ALIGN_LEFT
   },
]

export class FractoSequencePlanner extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
      all_sequences: [],
      selected_sequence_id: 0,
      sequence_steps: [],
      selected_step_index: 0
   }

   componentDidMount() {
      this.get_sequences()
   }

   get_sequences = () => {
      SequenceData.fetch_sequences(all_sequences => {
         console.log("all_sequences", all_sequences)
         this.setState({all_sequences: all_sequences})
         const selected_sequence_id_str = localStorage.getItem(LOCAL_STORAGE_KEY)
         if (selected_sequence_id_str) {
            const selected_sequence_id = parseInt(selected_sequence_id_str)
            this.setState({selected_sequence_id: selected_sequence_id})
            this.get_sequence_steps(selected_sequence_id)
         }
      })
   }

   get_sequence_steps = (sequence_id) => {
      SequenceData.fetch_sequence_steps(sequence_id, sequence_steps => {
         console.log("SequenceData.fetch_sequence_steps", sequence_steps)
         this.setState({sequence_steps: sequence_steps})
      })
   }

   add_step = (sequence_id, step_index, cb) => {
      const {focal_point, scope} = this.props
      const sequence_step = {
         sequence_id: sequence_id,
         step_index: step_index,
         frame_count: 100,
         fp_x: focal_point.x,
         fp_y: focal_point.y,
         scope: scope,
      }
      SequenceData.save_sequence_step(sequence_step, result => {
         console.log("new step id", result.insertId)
         cb(result.insertId)
      })
   }

   new_sequence = () => {
      SequenceData.save_sequence({}, result => {
         console.log("new sequence id", result.insertId)
         this.setState({selected_sequence_id: result.insertId})
         localStorage.setItem(LOCAL_STORAGE_KEY, `${result.insertId}`)
         this.add_step(result.insertId, 1, new_step_id => {
            this.get_sequences()
            this.get_sequence_steps(result.insertId)
         })
      })
   }

   select_sequence = (e) => {
      const selected_sequence_id = e.target.value
      this.setState({selected_sequence_id: selected_sequence_id})
      localStorage.setItem(LOCAL_STORAGE_KEY, `${selected_sequence_id}`)
      this.get_sequence_steps(selected_sequence_id)
   }

   render_focal_point = (focal_point) => {
      return render_coordinates(focal_point.x, focal_point.y)
   }

   render_step_list = () => {
      const {sequence_steps, selected_step_index} = this.state
      const rows = sequence_steps.map((step, i) => {
         const focal_point = {
            x: step.fp_x,
            y: step.fp_y
         }
         return {
            step_index: step.step_index,
            focal_point: [this.render_focal_point, focal_point],
            scope: step.scope
         }
      })
      return <CoolTable
         options={TABLE_CAN_SELECT}
         data={rows}
         columns={STEP_LIST_COLUMNS}
         on_select_row={step_index => this.setState({selected_step_index: step_index})}
         selected_row={selected_step_index}
      />
   }

   render() {
      const {all_sequences, selected_sequence_id} = this.state
      const new_button = <CoolButton
         primary={1}
         content={"new sequence"}
         on_click={this.new_sequence}
      />
      const select_options = all_sequences.map((sequence, i) => {
         return {
            label: sequence.name,
            value: sequence.id,
            help: `id = ${sequence.id}`
         }
      })
      const select_sequences = <CoolSelect
         options={select_options}
         value={selected_sequence_id}
         on_change={this.select_sequence}
      />
      const step_list = this.render_step_list()
      return [
         <BlockWrapper>
            <InlineWrapper>{new_button}</InlineWrapper>
            <InlineWrapper>{select_sequences}</InlineWrapper>
         </BlockWrapper>,
         <BlockWrapper>
            {step_list}
         </BlockWrapper>
      ]
   }
}

export default FractoSequencePlanner
