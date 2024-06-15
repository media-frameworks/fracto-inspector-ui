import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import {get_ideal_level} from "fracto/common/data/FractoData";
import FractoAlterableOutline from "fracto/common/ui/FractoAlterableOutline";
import FractoIncrementalRender from "fracto/common/render/FractoIncrementalRender";

const SCROLL_WIDTH_PX = 20
const INSPECTOR_PADDING_PX = 10
const SCOPE_FACTOR = 3.5
const INITIAL_STRATUM = {
   scope: SCOPE_FACTOR / 2.0,
   stratum_ref: React.createRef()
}

const StrataWrapper = styled(CoolStyles.Block)`
   height: 100%;
   overflow-y: scroll;   
`;

const ContextWrapper = styled(CoolStyles.Block)`
   background-color: #f8f8f8;
   border: 0.15rem solid #666666;
   margin: ${INSPECTOR_PADDING_PX - 2}px;
`;

const AddStepButton = styled(CoolStyles.Block)`
   ${CoolStyles.pointer}
   ${CoolStyles.align_center}
   ${CoolStyles.narrow_text_shadow}
   width: 8rem;
   margin: 0 auto 0.5rem;
   background-color: #aaaaaa;
   color: white;
   padding: 0.25rem 0.5rem;
   border-radius: 0.25rem;
   border: 1px solid #444444;
   letter-spacing: 1px;
`;

const DeleteButton = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.pointer}
   width: 1rem;
   height: 1rem;
   background-color: lightgrey;
   text-align: center;
   margin-left: -1rem;
   vertical-align: top;
   opacity: 0;
   &: hover {
      opacity: 1;
   }
`

export class InspectorStrata extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      disabled: PropTypes.bool.isRequired,
      update_counter: PropTypes.number.isRequired,
   }

   state = {
      strata: [INITIAL_STRATUM],
      stratum_index: 0,
      button_ref: React.createRef(),
      strata_top_px: 0,
   };

   componentDidMount() {
      setTimeout(() => {
         this.update_strata()
      }, 150)
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      if (prevProps.update_counter === this.props.update_counter) {
         return;
      }
      // this.update_strata()
      setTimeout(() => {
         const {button_ref} = this.state
         if (button_ref && button_ref.current) {
            button_ref.current.scrollIntoView({behavior: "smooth", block: "end"})
         }
      }, 1000)
   }

   detect_coverage = () => {
      return []
   }

   create_stratum = (scope) => {
      return {
         scope: scope,
         stratum_ref: React.createRef(),
         coverage: this.detect_coverage(scope)
      }
   }

   update_strata = () => {
      const {strata, button_ref} = this.state
      const {scope} = this.props
      let new_strata = strata
      let deepest_scope = new_strata[new_strata.length - 1].scope
      while (deepest_scope > scope / SCOPE_FACTOR) {
         const new_scope = deepest_scope / SCOPE_FACTOR
         if (new_scope <= scope) {
            break;
         }
         const new_stratum = this.create_stratum(new_scope)
         new_strata.push(new_stratum)
         deepest_scope = new_scope
      }
      while (deepest_scope < scope / SCOPE_FACTOR) {
         new_strata.pop()
         deepest_scope = new_strata[new_strata.length - 1].scope / SCOPE_FACTOR
      }
      new_strata.pop()
      const new_stratum = this.create_stratum(scope * SCOPE_FACTOR)
      new_strata.push(new_stratum)
      this.setState({
         strata: new_strata,
         stratum_index: new_strata.length - 1
      })
      setTimeout(() => {
         if (button_ref && button_ref.current) {
            button_ref.current.scrollIntoView({behavior: "smooth", block: "end"})
         }
      }, 150)
   }

   on_scroll = (evt) => {
      this.setState({strata_top_px: evt.scrollTop})
   }

   add_step = () => {
      const {strata} = this.state
      const {disabled, on_scope_changed} = this.props
      if (disabled) {
         return;
      }
      const new_scope = strata[strata.length - 1].scope / SCOPE_FACTOR
      const new_stratum = this.create_stratum(new_scope)
      strata.push(new_stratum)
      this.setState({
         strata: strata,
         stratum_index: strata.length - 1
      })
      on_scope_changed(strata[strata.length - 1].scope / SCOPE_FACTOR)
   }

   delete_step = (index) => {
      const {strata, stratum_index} = this.state
      const {on_scope_changed, disabled} = this.props
      if (disabled) {
         return;
      }
      strata.splice(index, 1)
      this.setState({
         strata: strata,
         stratum_index: stratum_index - 1
      })
      const new_scope = strata[stratum_index - 1].scope
      on_scope_changed(new_scope / SCOPE_FACTOR)
   }

   render() {
      const {strata, stratum_index, button_ref} = this.state
      const {width_px, focal_point, disabled, on_focal_point_changed} = this.props
      const canvas_width = width_px - 2 * INSPECTOR_PADDING_PX - SCROLL_WIDTH_PX
      let tile_outline = []
      const all_strata = strata.map((stratum, index) => {
         const canvas_scope = stratum.scope
         if (stratum_index === index) {
            const outline_bounds = {
               left: focal_point.x - canvas_scope / (2 * SCOPE_FACTOR),
               right: focal_point.x + canvas_scope / (2 * SCOPE_FACTOR),
               top: focal_point.y + canvas_scope / (2 * SCOPE_FACTOR),
               bottom: focal_point.y - canvas_scope / (2 * SCOPE_FACTOR),
            }
            tile_outline = !stratum.stratum_ref.current ? '' : <FractoAlterableOutline
               key={'tile-outline'}
               canvas_width_px={canvas_width}
               wrapper_ref={stratum.stratum_ref}
               outline_bounds={outline_bounds}
               focal_point={focal_point}
               canvas_scope={canvas_scope}
               on_focal_point_change={focal_point => on_focal_point_changed(focal_point)}
               disabled={disabled}
            />
         }
         const wrapper_style = {
            width: `${canvas_width}px`,
            height: `${canvas_width}px`,
         }
         const ideal_level = get_ideal_level(canvas_width, canvas_scope) - 1
         const delete_button_style = {
            top: `${canvas_width * index + 15}px`,
            cursor: disabled ? 'default' : 'pointer'
         }
         const delete_button = !index ? '' : <DeleteButton
            title={disabled ? 'disabled during update' : 'click to zoom out 2 levels'}
            style={delete_button_style}
            onClick={e => this.delete_step(index)}>
            {"X"}
         </DeleteButton>
         return <ContextWrapper
            key={`stratum-${index}`}
            ref={stratum.stratum_ref}
            style={wrapper_style}>
            <FractoIncrementalRender
               width_px={canvas_width}
               scope={canvas_scope}
               focal_point={focal_point}
               level={ideal_level > 1 ? ideal_level : 2}
               on_plan_complete={() => {
               }}
               disabled={disabled}/>
            {delete_button}
         </ContextWrapper>
      })
      const button_style = {
         cursor: !disabled ? "pointer" : "default",
         opacity: disabled ? '0.5' : '1.0'
      }
      const add_step_button = <AddStepButton
         ref={button_ref}
         key={'add-step-button'}
         style={button_style}
         onClick={e => this.add_step()}>
         {'one step down'}
      </AddStepButton>
      return <StrataWrapper>
         {all_strata.concat(tile_outline).concat(add_step_button)}
      </StrataWrapper>
   }
}

export default InspectorStrata;
