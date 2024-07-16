import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import BailiwickData from "fracto/common/feature/BailiwickData";
import BailiwickList from "fracto/common/ui/BailiwickList";

const SELECTED_BAILIWICK_KEY = "selected_bailiwick";

const ContentWrapper = styled(CoolStyles.Block)`
   background-color: white;
   overflow: hidden;
`

const SelectWrapper = styled(CoolStyles.InlineBlock)`
   padding: 0.5rem;
   margin: 0;
   height: 35rem;
   overflow-y: scroll;
   overflow-x: hidden;
`

export class InspectorBailiwicks extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      all_bailiwicks: [],
      bailiwick: null,
   }

   componentDidMount() {
      BailiwickData.fetch_bailiwicks(all_bailiwicks => {
         this.setState({all_bailiwicks: all_bailiwicks,})
      })
   }

   select_bailiwick = (bailiwick) => {
      const { selected_nodes} = this.state
      const {on_focal_point_changed, on_scope_changed, in_wait} = this.props
      if (in_wait && selected_nodes.length) {
         return;
      }
      this.setState({bailiwick: bailiwick,})
      const display_settings = JSON.parse(bailiwick.display_settings)
      on_focal_point_changed(display_settings.focal_point)
      on_scope_changed(display_settings.scope)
      localStorage.setItem(SELECTED_BAILIWICK_KEY, `${bailiwick.id}`)
   }

   render() {
      const {in_wait, width_px} = this.props
      return <ContentWrapper>
         <SelectWrapper style={{width: width_px}}>
            <BailiwickList
               on_select={this.select_bailiwick}
               in_wait={in_wait}
            />
         </SelectWrapper>
      </ContentWrapper>
   }
}

export default InspectorBailiwicks;
