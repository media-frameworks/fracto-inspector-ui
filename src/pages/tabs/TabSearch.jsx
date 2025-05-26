import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import FractoUtil from "../../fracto/common/FractoUtil";

const ContentWrapper = styled(CoolStyles.Block)`
    padding: 0.5rem;
    background-color: white;
`

export class TabSearch extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {}

   componentDidMount() {
   }

   on_change = (e) => {
      const {on_scope_changed, on_focal_point_changed} = this.props
      const short_code = e.target.value
      console.log('short_code', short_code);
      if (short_code.length > 3) {
         const bounds = FractoUtil.bounds_from_short_code(short_code)
         const scope = bounds.right - bounds.left
         on_focal_point_changed({
            x: bounds.left+scope / 2,
            y: bounds.bottom+scope / 2,
         })
         setTimeout(()=>{
            on_scope_changed(scope)
         }, 500)
      }
   }

   render() {
      return <ContentWrapper>
         <input type={"number"} onChange={this.on_change}/>
      </ContentWrapper>
   }
}

export default TabSearch;
