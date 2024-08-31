import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class TabTemplate extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
      in_harvest: false
   }

   componentDidMount() {
   }

   go = () => {
      this.setState({in_harvest : true})
   }

   render() {
      return <ContentWrapper>
         <CoolStyles.Block onClick={this.go}>
            go
         </CoolStyles.Block>
      </ContentWrapper>
   }
}

export default TabTemplate;
