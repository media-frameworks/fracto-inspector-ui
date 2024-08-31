import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolSelect, CoolColors} from "common/ui/CoolImports";
import BurrowsData from "fracto/common/feature/BurrowsData";

const SELECTED_BURROW_KEY = "selected_burrow";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

const SelectWrapper = styled(CoolStyles.InlineBlock)`
   margin: 0;
`

const LinkWrapper = styled(CoolStyles.InlineBlock)`
   margin-left: 0.5rem;
   vertical-align: middle;
   line-height: 1.75rem;
`

const CoolLink = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.italic};
   ${CoolStyles.pointer};
   color: ${CoolColors.cool_blue};
   font-weight: normal;
   &: hover{
      ${CoolStyles.underline};
   }
`

export class TabBurrows extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
      all_burrows: [],
      burrow_id: 0,
   }

   componentDidMount() {
      const {on_focal_point_changed, on_scope_changed} = this.props
      let burrow_id = localStorage.getItem(SELECTED_BURROW_KEY)
      BurrowsData.fetch_burrows(all_burrows => {
         //if (!burrow_id) {
            burrow_id = all_burrows[0].id
         //}
         //else {
         //   burrow_id = parseInt(burrow_id)
         //}
         this.setState({
            all_burrows: all_burrows,
            burrow_id: burrow_id,
         })
         const burrow = all_burrows.find(burrow => burrow.id === burrow_id)
         console.log("all_burrows", all_burrows)
         setTimeout(() => {
            const focal_point = JSON.parse(burrow.focal_point)
            const scope = burrow.scope
            on_focal_point_changed(focal_point)
            on_scope_changed(scope)
         }, 1000)
      })
   }

   select_burrow = (id) => {
      const {all_burrows} = this.state
      const {on_focal_point_changed, on_scope_changed} = this.props
      this.setState({
         burrow_id: id,
      })
      const burrow = all_burrows.find(burrow => burrow.id === id)
      if (!burrow) {
         return;
      }
      const focal_point = JSON.parse(burrow.focal_point)
      const scope = burrow.scope
      console.log("select_burrow focal_point, scope", focal_point, scope)
      on_focal_point_changed(focal_point)
      on_scope_changed(scope)
      localStorage.setItem(SELECTED_BURROW_KEY, `${id}`)
   }

   on_resize = (factor = 1) => {
      const {all_burrows, burrow_id} = this.state
      const {on_scope_changed} = this.props
      const burrow = all_burrows.find(burrow => burrow.id === burrow_id)
      on_scope_changed(burrow.scope / factor)
   }

   render() {
      const {all_burrows, burrow_id} = this.state
      const select_options = all_burrows.map((burrow, i) => {
         return {
            label: burrow.name,
            value: burrow.id,
            help: `#${i}`
         }
      })
      const burrows_list = <CoolSelect
         on_change={e => this.select_burrow(parseInt(e.target.value))}
         value={burrow_id}
         options={select_options}/>
      return <ContentWrapper>
         <SelectWrapper>{burrows_list}</SelectWrapper>
         <LinkWrapper onClick={e => this.on_resize()}><CoolLink>{"re-size"}</CoolLink></LinkWrapper>
         <LinkWrapper onClick={e => this.on_resize(2)}><CoolLink>{"+1"}</CoolLink></LinkWrapper>
         <LinkWrapper onClick={e => this.on_resize(4)}><CoolLink>{"+2"}</CoolLink></LinkWrapper>
      </ContentWrapper>
   }
}

export default TabBurrows;
