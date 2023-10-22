import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import {render_coordinates} from "fracto/common/FractoStyles";
import FractoData, {get_ideal_level} from "../../fracto/common/data/FractoData";

const LABEL_WIDTH_PX = 100

const DetailRow = styled(CoolStyles.Block)`
   margin: 0;
`;

const DetailLabel = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.align_right}
   ${CoolStyles.italic}
   ${CoolStyles.bold}
   ${CoolStyles.align_top}
   width: ${LABEL_WIDTH_PX}px;
   margin-right: 0.5rem;
   color: #aaaaaa;
   line-height: 1rem;
   margin-top: 0.25rem;
`;

const DetailData = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.align_middle}
   margin: 0.25rem;
   line-height: 1rem;
`;

const NumberValue = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.deep_blue_text}
   ${CoolStyles.monospace}
   ${CoolStyles.bold}
   font-size: 0.95rem;
`;

export class InspectorDetails extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      cursor_point: PropTypes.object.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   render_focal_point = () => {
      const {focal_point} = this.props
      return render_coordinates(focal_point.x, focal_point.y)
   }

   render_cursor = () => {
      const {cursor_point} = this.props
      if (!cursor_point) {
         return '-'
      }
      return render_coordinates(cursor_point.x, cursor_point.y)
   }

   render_scope = () => {
      const {scope} = this.props
      return <NumberValue>{scope}</NumberValue>
   }

   render_tiles = () => {
      const {width_px, scope, focal_point} = this.props
      const ideal_level = get_ideal_level(width_px, scope)
      const tile_counts = []
      for (let i = 0; i < 35; i++) {
         const tiles_in_level = FractoData.tiles_in_scope(ideal_level + i - 1, focal_point, scope);
         if (!tiles_in_level.length) {
            break;
         }
         tile_counts[i] = tiles_in_level.length
      }
      const count_list = tile_counts.filter((count, i) => count && i < 8)
         .map((count, index) => {
            return `${ideal_level + index}:${count}`
         }).join(', ')
      return <NumberValue>{count_list}</NumberValue>
   }

   render() {
      const {width_px} = this.props
      return [
         {label: "scope", render: this.render_scope},
         {label: "centered at", render: this.render_focal_point},
         {label: "coverage", render: this.render_tiles},
         {label: "cursor", render: this.render_cursor},
      ].map(detail => {
         const data_width_px = width_px - LABEL_WIDTH_PX - 250
         return <DetailRow>
            <DetailLabel>{detail.label}</DetailLabel>
            <DetailData style={{maxWidth: `${data_width_px}px`}}>{detail.render()}</DetailData>
         </DetailRow>
      })
   }
}

export default InspectorDetails
