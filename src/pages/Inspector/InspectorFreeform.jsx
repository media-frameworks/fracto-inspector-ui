import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import HolodeckController from "common/threed/holodeck/HolodeckController";
import {OPTION_SHOW_BAILIWICKS, OPTION_VIEW_3D} from '../PageMain'

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class InspectorFreeform extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      options: PropTypes.object.isRequired,
      set_options: PropTypes.func.isRequired,
   }

   state = {}

   componentDidMount() {
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
   }

   toggle_show_bailiwicks = (e) => {
      const {options, set_options} = this.props
      if (options[OPTION_SHOW_BAILIWICKS]) {
         delete (options[OPTION_SHOW_BAILIWICKS])
      } else {
         options[OPTION_SHOW_BAILIWICKS] = true
      }
      set_options(options)
   }

   toggle_3d_link = (e) => {
      const {options, set_options} = this.props
      if (options[OPTION_VIEW_3D]) {
         delete (options[OPTION_VIEW_3D])
      } else {
         options[OPTION_VIEW_3D] = true
      }
      set_options(options)
   }

   update_controls = (holodeck_controls) => {
      const {options, set_options} = this.props
      let new_options = JSON.parse(JSON.stringify(options))
      new_options.holodeck_controls = holodeck_controls
      set_options(new_options)
   }

   render() {
      const {options} = this.props
      const show_bailiwicks_link = <CoolStyles.LinkSpan
         onClick={this.toggle_show_bailiwicks}>
         {`${options[OPTION_SHOW_BAILIWICKS] ? 'hide' : 'show'} bailiwicks`}
      </CoolStyles.LinkSpan>
      const view_3d_link = <CoolStyles.LinkSpan
         onClick={this.toggle_3d_link}>
         {`view ${options[OPTION_VIEW_3D] ? 'flat' : '3D'}`}
      </CoolStyles.LinkSpan>
      const holodeck_controls = !options[OPTION_VIEW_3D] ? '' : <HolodeckController
         controls={options.holodeck_controls}
         on_update={this.update_controls}
      />
      return <ContentWrapper>
         <CoolStyles.Block>{show_bailiwicks_link}</CoolStyles.Block>
         <CoolStyles.Block>{view_3d_link}</CoolStyles.Block>
         <CoolStyles.Block>{holodeck_controls}</CoolStyles.Block>
      </ContentWrapper>
   }
}

export default InspectorFreeform;
