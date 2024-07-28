import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class InspectorCoverage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      ctx: PropTypes.object.isRequired,
   }

   static defaultProps = {
   }

   state = {}

   componentDidMount() {
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
   }

   render() {
      return <ContentWrapper>
         {'InspectorCoverage'}
      </ContentWrapper>
   }
}

export default InspectorCoverage;
