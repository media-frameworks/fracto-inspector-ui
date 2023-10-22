import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import {get_ideal_level} from "fracto/common/data/FractoData";
import FractoAlterableOutline from "fracto/common/render/FractoAlterableOutline";
import FractoLayeredCanvas, {QUALITY_LOW} from "fracto/common/render/FractoLayeredCanvas";

const SCROLL_WIDTH_PX = 20
const INSPECTOR_PADDING_PX = 10
const INITIAL_STRATUM = {
   scope: 2.5,
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
   margin: 0 auto;
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
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      disabled: PropTypes.bool.isRequired,
   }

   state = {
      strata: [INITIAL_STRATUM],
      stratum_index: 0,
      strata_ref: React.createRef(),
      strata_top_px: 0,
   };

   componentDidMount() {
      const {strata_ref} = this.state
      const {on_scope_changed} = this.props
      on_scope_changed(INITIAL_STRATUM.scope)
      setTimeout(() => {
         if (strata_ref.current) {
            strata_ref.current.addEventListener("scroll", this.on_scroll);
         }
      }, 3000)
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
      const newScope = strata[strata.length - 1].scope / 5
      const new_stratum = {
         scope: newScope,
         stratum_ref: React.createRef()
      }
      strata.push(new_stratum)
      this.setState({
         strata: strata,
         stratum_index: strata.length - 1
      })
      on_scope_changed(newScope)
   }

   delete_step = (index) => {
      const {strata, stratum_index} = this.state
      const {on_scope_changed} = this.props
      strata.splice(index, 1)
      this.setState({
         strata: strata,
         stratum_index: stratum_index - 1
      })
      const newScope = strata[stratum_index - 1].scope
      on_scope_changed(newScope)
   }

   render() {
      const {strata, stratum_index, strata_ref} = this.state
      const {width_px, focal_point, disbaled, on_focal_point_changed} = this.props
      const canvas_width = width_px - 2 * INSPECTOR_PADDING_PX - SCROLL_WIDTH_PX
      let tile_outline = []
      const all_strata = strata.map((stratum, index) => {
         const canvas_scope = stratum.scope
         if (stratum_index === index) {
            const outline_bounds = {
               left: focal_point.x - canvas_scope / 10,
               right: focal_point.x + canvas_scope / 10,
               top: focal_point.y + canvas_scope / 10,
               bottom: focal_point.y - canvas_scope / 10,
            }
            tile_outline = !stratum.stratum_ref.current ? '' : <FractoAlterableOutline
               canvas_width_px={canvas_width}
               wrapper_ref={stratum.stratum_ref}
               outline_bounds={outline_bounds}
               focal_point={focal_point}
               canvas_scope={canvas_scope}
               on_focal_point_change={focal_point => on_focal_point_changed(focal_point)}
               disabled={disbaled}
            />
         }
         const wrapper_style = {
            width: `${canvas_width}px`,
            height: `${canvas_width}px`,
         }
         const ideal_level = get_ideal_level(canvas_width, canvas_scope)
         const delete_button = !index ? '' : <DeleteButton
            style={{top: `${canvas_width * index + 15}px`}}
            onClick={e => this.delete_step(index)}>
            {"X"}
         </DeleteButton>
         return <ContextWrapper
            ref={stratum.stratum_ref}
            style={wrapper_style}>
            <FractoLayeredCanvas
               width_px={canvas_width}
               scope={canvas_scope}
               focal_point={focal_point}
               level={ideal_level >= 3 ? ideal_level : 3}
               quality={QUALITY_LOW}
            />
            {delete_button}
         </ContextWrapper>
      })
      const button_style = {cursor: !disbaled ? "pointer" : "default"}
      const add_step_button = <AddStepButton
         style={button_style}
         onClick={e => this.add_step()}>
         {'one step down'}
      </AddStepButton>
      return <StrataWrapper
         ref={strata_ref}>
         {all_strata.concat(tile_outline).concat(add_step_button)}
      </StrataWrapper>
   }
}

export default InspectorStrata;
