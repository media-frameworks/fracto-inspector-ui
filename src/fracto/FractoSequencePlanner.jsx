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
import LinearEquation from "common/math/LinearEquation";
import PolyCurveEditor from "common/math/PolyCurveEditor";

const LOCAL_STORAGE_KEY = "selected_sequence"

const BlockWrapper = styled(CoolStyles.Block)`
   margin: 0.5rem;
   background-color: white;
`

const InlineWrapper = styled(CoolStyles.InlineBlock)`
   margin: 0 0.5rem 0.25rem 0;
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
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      all_sequences: [],
      selected_sequence_id: 0,
      sequence_steps: [],
      selected_row_index: 0,
      fp_x_poly: [],
      fp_y_poly: [],
      scope_poly: [],
      step_parameters: {}
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
         const step_parameters = {
            fp_x_steps: sequence_steps.map(step => step.fp_x),
            fp_y_steps: sequence_steps.map(step => step.fp_y),
            scope_steps: sequence_steps.map(step => step.scope),
         }
         const fp_x_poly = LinearEquation.solve_standard_polynolial(step_parameters.fp_x_steps);
         const fp_y_poly = LinearEquation.solve_standard_polynolial(step_parameters.fp_y_steps);
         const scope_poly = LinearEquation.solve_standard_polynolial(step_parameters.scope_steps);
         this.setState({
            sequence_steps: sequence_steps,
            step_parameters: step_parameters,
            fp_x_poly: fp_x_poly,
            fp_y_poly: fp_y_poly,
            scope_poly: scope_poly,
         })
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

   update_step = (step, cb) => {
      console.log("update_step", step)
      if (!step) {
         return;
      }
      const sequence_step = {
         id: step.id,
         fp_x: step.fp_x,
         fp_y: step.fp_y,
         scope: step.scope,
      }
      SequenceData.save_sequence_step(sequence_step, result => {
         console.log("update_step result", result)
         cb(result.insertId)
      })
   }

   new_step = () => {
      const {selected_sequence_id, sequence_steps} = this.state
      this.add_step(selected_sequence_id, sequence_steps.length + 1, new_step_id => {
         console.log("new step id", new_step_id)
         this.get_sequence_steps(selected_sequence_id)
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

   on_select_row = (row_index) => {
      // console.log("on_select_row", row_index)
      const {sequence_steps} = this.state
      const {on_focal_point_changed, on_scope_changed, in_wait} = this.props
      if (in_wait) {
         return;
      }
      this.setState({selected_row_index: row_index})
      const step = sequence_steps[row_index]
      const focal_point = {
         x: step.fp_x,
         y: step.fp_y
      }
      on_focal_point_changed(focal_point)
      on_scope_changed(step.scope)
   }

   render_step_list = () => {
      const {sequence_steps, selected_row_index} = this.state
      // console.log("render_step_list", sequence_steps)
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
         on_select_row={this.on_select_row}
         selected_row={selected_row_index}
      />
   }

   play_steps = () => {
      const {sequence_steps, fp_x_poly, fp_y_poly, scope_poly} = this.state;
      const {on_scope_changed, on_focal_point_changed} = this.props;

      let position = 0;
      const interval = setInterval(() => {
         if (this.props.in_wait) {
            return
         }
         const fp_x = LinearEquation.render_value(fp_x_poly, position)
         const fp_y = LinearEquation.render_value(fp_y_poly, position)
         const scope = LinearEquation.render_value(scope_poly, position)
         const focal_point = {
            x: fp_x,
            y: fp_y
         }
         on_focal_point_changed(focal_point)
         on_scope_changed(scope)
         position += 0.1;

         if (position >= sequence_steps.length - 1) {
            clearInterval(interval);
         }
      }, 25);
   }

   on_update_poly_x = (new_inputs, step_index) => {
      const {step_parameters, sequence_steps} = this.state
      let new_step_parameters = JSON.parse(JSON.stringify(step_parameters))
      let new_sequence_steps = JSON.parse(JSON.stringify(sequence_steps))
      new_step_parameters.fp_x_steps = new_inputs
      const fp_x_poly = LinearEquation.solve_standard_polynolial(new_step_parameters.fp_x_steps);
      for (let i = 0; i < new_sequence_steps.length; i++) {
         new_sequence_steps[i].fp_x = new_inputs[i]
      }
      this.update_step(new_sequence_steps[step_index], result => {
         console.log("this.update_step", result)
         this.setState({
            step_parameters: new_step_parameters,
            sequence_steps: new_sequence_steps,
            fp_x_poly: fp_x_poly
         })
      })
   }

   on_update_poly_y = (new_inputs, step_index) => {
      const {step_parameters, sequence_steps} = this.state
      let new_step_parameters = JSON.parse(JSON.stringify(step_parameters))
      let new_sequence_steps = JSON.parse(JSON.stringify(sequence_steps))
      new_step_parameters.fp_y_steps = new_inputs
      const fp_y_poly = LinearEquation.solve_standard_polynolial(new_step_parameters.fp_y_steps);
      for (let i = 0; i < new_sequence_steps.length; i++) {
         new_sequence_steps[i].fp_y = new_inputs[i]
      }
      this.update_step(new_sequence_steps[step_index], result => {
         console.log("this.update_step", result)
         this.setState({
            step_parameters: new_step_parameters,
            sequence_steps: new_sequence_steps,
            fp_y_poly: fp_y_poly
         })
      })
   }

   on_update_poly_scope = (new_inputs, step_index) => {
      const {step_parameters, sequence_steps} = this.state
      let new_step_parameters = JSON.parse(JSON.stringify(step_parameters))
      let new_sequence_steps = JSON.parse(JSON.stringify(sequence_steps))
      new_step_parameters.scope_steps = new_inputs
      const scope_poly = LinearEquation.solve_standard_polynolial(new_step_parameters.scope_steps);
      for (let i = 0; i < new_sequence_steps.length; i++) {
         new_sequence_steps[i].scope = new_inputs[i]
      }
      this.update_step(new_sequence_steps[step_index], result => {
         console.log("this.update_step", result)
         this.setState({
            step_parameters: new_step_parameters,
            sequence_steps: new_sequence_steps,
            scope_poly: scope_poly
         })
      })
   }

   render() {
      const {all_sequences, selected_sequence_id, step_parameters} = this.state
      const new_sequence_button = <CoolButton
         primary={1}
         content={"new sequence"}
         on_click={this.new_sequence}
      />
      const new_step_button = !selected_sequence_id ? [] : <CoolButton
         primary={1}
         content={"new step"}
         on_click={this.new_step}
      />
      const play_steps_button = !selected_sequence_id ? [] : <CoolButton
         primary={1}
         content={"play steps"}
         on_click={this.play_steps}
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
            <InlineWrapper>{new_sequence_button}</InlineWrapper>
            <InlineWrapper>{select_sequences}</InlineWrapper>
         </BlockWrapper>,
         <BlockWrapper>
            <InlineWrapper>{new_step_button}</InlineWrapper>
         </BlockWrapper>,
         <BlockWrapper>
            {step_list}
         </BlockWrapper>,
         <BlockWrapper>
            <InlineWrapper>{play_steps_button}</InlineWrapper>
         </BlockWrapper>,
         <BlockWrapper>
            <CoolStyles.Block>focal point x:</CoolStyles.Block>
            <PolyCurveEditor
               inputs={step_parameters.fp_x_steps ? step_parameters.fp_x_steps : []}
               on_update={this.on_update_poly_x}
            />
         </BlockWrapper>,
         <BlockWrapper>
            <CoolStyles.Block>focal point y:</CoolStyles.Block>
            <PolyCurveEditor
               inputs={step_parameters.fp_y_steps ? step_parameters.fp_y_steps : []}
               on_update={this.on_update_poly_y}
            />
         </BlockWrapper>,
         <BlockWrapper>
            <CoolStyles.Block>scope:</CoolStyles.Block>
            <PolyCurveEditor
               inputs={step_parameters.scope_steps ? step_parameters.scope_steps : []}
               on_update={this.on_update_poly_scope}
            />
         </BlockWrapper>,
      ]
   }
}

export default FractoSequencePlanner
