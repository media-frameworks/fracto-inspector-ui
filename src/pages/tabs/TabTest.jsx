import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import Monomial from "../../common/math/Monomial";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class TabTest extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
   }

   componentDidMount() {
   }

   go = () => {
      let m = new Monomial([0n, 1n])
      const base = new Monomial([0n, 1n])
      for (let i = 0; i < 6; i++) {
         const m_squared = m.mul(m)
         const orbital_point = m_squared.add(base)
         console.log(`${i + 3}-point: ${orbital_point.to_string()}`)
         m = new Monomial(orbital_point.coefficients)
      }
   }

   render() {
      return <ContentWrapper>
         <CoolStyles.Block onClick={this.go}>
            go
         </CoolStyles.Block>
      </ContentWrapper>
   }
}

export default TabTest;
