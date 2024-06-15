import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolButton, CoolStyles} from "common/ui/CoolImports";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class InspectorSound extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      canvas_buffer: PropTypes.array.isRequired,
      ctx: PropTypes.object.isRequired,
      in_navlock: PropTypes.bool,
      on_navlock_changed: PropTypes.func,
      click_point: PropTypes.object
   }

   static defaultProps = {
      in_navlock: false,
      on_navlock_changed: null,
      click_point: {}
   }

   state = {}

   componentDidMount() {
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
   }

   set_navlock = () => {
      const {in_navlock, on_navlock_changed} = this.props
      on_navlock_changed(!in_navlock)
   }

   render() {
      const {in_navlock} = this.props
      const navlock_button = <CoolButton
         primary={1}
         on_click={this.set_navlock}
         content={!in_navlock ? "lock" : "unlock"}
         disabled={false}
      />
      return <ContentWrapper>
         {navlock_button}
      </ContentWrapper>
   }
}

export default InspectorSound;
