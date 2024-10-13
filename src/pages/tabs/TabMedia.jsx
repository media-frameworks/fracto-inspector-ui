import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import FractoFocalTransit from "fracto/common/ui/FractoFocalTransit";
import FractoScopeTransit from "fracto/common/ui/FractoScopeTransit";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
   text-align: left;
`

const TRANSIT_SHRINKAGE = 0.50

export class TabMedia extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {}

   render() {
      const {
         width_px, focal_point, scope,
         on_focal_point_changed, on_scope_changed, in_wait
      } = this.props
      const focal_transit_width_px = width_px / 1.618
      const scope_transit_width_px = width_px - focal_transit_width_px
      return <ContentWrapper>
         <FractoFocalTransit
            width_px={focal_transit_width_px * TRANSIT_SHRINKAGE}
            scope={scope}
            focal_point={focal_point}
            on_focal_point_changed={on_focal_point_changed}
            in_wait={in_wait}
         />
         <FractoScopeTransit
            width_px={scope_transit_width_px * TRANSIT_SHRINKAGE}
            height_px={focal_transit_width_px * TRANSIT_SHRINKAGE}
            scope={scope}
            on_scope_changed={on_scope_changed}
            in_wait={in_wait}
         />
      </ContentWrapper>
   }
}

export default TabMedia;
