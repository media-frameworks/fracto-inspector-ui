import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class InspectorEffects extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_effect_changed: PropTypes.func.isRequired,
      update_counter: PropTypes.number.isRequired,
   }

   state = {}

   componentDidMount() {
      const {on_effect_changed} = this.props
      // on_effect_changed(this.change_colors)
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
   }

   change_colors = () => {
      const {update_counter} = this.props
      console.log("change_colors", update_counter)
   }

   render() {
      return <ContentWrapper>
         select effects here
      </ContentWrapper>
   }
}

export default InspectorEffects;
