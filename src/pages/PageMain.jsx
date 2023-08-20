import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppPageMain from 'common/app/AppPageMain';
import {CoolStyles} from 'common/ui/CoolImports';

import FractoCommon from "fracto/common/FractoCommon";
import FractoDataLoader from "fracto/common/data/FractoDataLoader";
import FractoData, {BIN_VERB_INDEXED, get_ideal_level} from "fracto/common/data/FractoData";
import FractoLayeredCanvas, {QUALITY_LOW, QUALITY_MEDIUM} from "fracto/common/render/FractoLayeredCanvas";
import FractoAlterableOutline from "fracto/common/render/FractoAlterableOutline";
import FractoRasterCanvas from "../fracto/common/render/FractoRasterCanvas";

const SCROLL_WIDTH_PX = 20
const INSPECTOR_PADDING_PX = 10
const INITIAL_STRATUM = {
   scope: 2.5,
   stratum_ref: React.createRef()
}
const RENDER_TYPE_LAYERED = 'render_layered'
const RENDER_TYPE_RASTER = 'render_raster'

const StrataWrapper = styled(CoolStyles.Block)`
   height: 100%;
   overflow-y: scroll;   
`;

const ContextWrapper = styled(CoolStyles.Block)`
   background-color: #f8f8f8;
   border: 0.15rem solid #666666;
   margin: ${INSPECTOR_PADDING_PX - 2}px;
`;

const InspectorWrapper = styled(CoolStyles.InlineBlock)`
   height: 100%;
   margin: ${INSPECTOR_PADDING_PX - 2}px;
   background-color: light-grey;
   border: 0.15rem solid #666666;
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

export class PageMain extends Component {

   static propTypes = {
      app_name: PropTypes.string.isRequired,
   }

   state = {
      left_width: 0,
      right_width: 0,
      indexed_loading: true,
      focal_point: {x: -0.75, y: 0},
      inspector_ready: false,
      strata: [INITIAL_STRATUM],
      stratum_index: 0,
      render_type: RENDER_TYPE_RASTER,
      strata_ref: React.createRef(),
      strata_top_px: 0
   };

   static inspector_ref = React.createRef()

   componentDidMount() {
      const {strata_ref} = this.state
      FractoDataLoader.load_tile_set_async(BIN_VERB_INDEXED, result => {
         console.log("FractoDataLoader.load_tile_set_async", BIN_VERB_INDEXED, result)
         for (let level = 3; level <= 34; level++) {
            FractoData.get_cached_tiles(level, BIN_VERB_INDEXED)
         }
         this.setState({indexed_loading: false});
      });
      setTimeout(()=>{
         strata_ref.current.addEventListener("scroll", this.on_scroll);
      }, 2000)
   }

   on_scroll = (evt) => {
      this.setState({strata_top_px: evt.scrollTop})
   }

   on_resize = (left_width, right_width) => {
      this.setState({
         left_width: left_width,
         right_width: right_width
      })
   }

   on_focal_point_change = (new_focal_point) => {
      this.setState({
         focal_point: new_focal_point,
         inspector_ready: false
      })
   }

   on_add_step = () => {
      const {strata, inspector_ready} = this.state
      if (!inspector_ready) {
         return;
      }
      const new_stratum = {
         scope: strata[strata.length - 1].scope / 5,
         stratum_ref: React.createRef()
      }
      strata.push(new_stratum)
      this.setState({
         strata: strata,
         stratum_index: strata.length - 1
      })
   }

   delete_step = (index) => {
      const {strata, stratum_index} = this.state
      strata.splice(index, 1)
      this.setState({
         strata: strata,
         stratum_index: stratum_index - 1
      })
   }

   render_strata = (width_px) => {
      const {focal_point, inspector_ready, strata, stratum_index, strata_ref, strata_top_px} = this.state
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
               on_focal_point_change={focal_point => this.on_focal_point_change(focal_point)}
               disabled={!inspector_ready}
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
      const button_style = { cursor: inspector_ready ? "pointer" : "default" }
      const add_step_button = <AddStepButton
         style={button_style}
         onClick={e => this.on_add_step()}>
         {'one step down'}
      </AddStepButton>
      return <StrataWrapper
         ref={strata_ref}>
         {all_strata.concat(tile_outline).concat(add_step_button)}
      </StrataWrapper>
   }

   render_inspection = (width_px) => {
      const {focal_point, strata, stratum_index, render_type} = this.state
      let canvas_size_px = 1
      const sontainer = PageMain.inspector_ref.current
      if (sontainer) {
         const container_bounds = sontainer.getBoundingClientRect()
         canvas_size_px = Math.round(container_bounds.height - 2 * INSPECTOR_PADDING_PX)
      }
      const scope = strata[stratum_index].scope / 5;
      const ideal_level = get_ideal_level(canvas_size_px, scope)
      const rendering = render_type === RENDER_TYPE_LAYERED ? <FractoLayeredCanvas
         width_px={canvas_size_px}
         scope={scope}
         focal_point={focal_point}
         level={ideal_level}
         quality={QUALITY_MEDIUM}
         on_plan_complete={ref => this.setState({inspector_ready: true})}
      /> : <FractoRasterCanvas
         width_px={canvas_size_px}
         scope={scope}
         focal_point={focal_point}
         level={ideal_level}
         on_plan_complete={ref => this.setState({inspector_ready: true})}
      />
      return <InspectorWrapper
         ref={PageMain.inspector_ref}>
         {rendering}
      </InspectorWrapper>
   }

   render() {
      const {left_width, right_width, indexed_loading} = this.state;
      const {app_name} = this.props;
      const left_side = this.render_strata(left_width)
      const right_side = this.render_inspection(right_width)
      if (indexed_loading) {
         return FractoCommon.loading_wait_notice()
      }
      return <AppPageMain
         app_name={app_name}
         on_resize={(left_width, right_width) => this.on_resize(left_width, right_width)}
         content_left={left_side}
         content_right={right_side}
      />
   }
}

export default PageMain;
