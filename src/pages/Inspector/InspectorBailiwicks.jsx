import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolSelect, CoolTable, CoolColors} from "common/ui/CoolImports";
import BailiwickData from "fracto/common/data/BailiwickData";
import {
   CELL_ALIGN_CENTER,
   CELL_TYPE_NUMBER,
   CELL_TYPE_TEXT
} from "common/ui/CoolTable";
import {TABLE_CAN_SELECT} from "common/ui/CoolTable"

const SELECTED_BAILIWICK_KEY = "selected_bailiwick";

const NODES_HEADERS = [
   {
      id: "name",
      label: "name",
      type: CELL_TYPE_TEXT,
      width_px: 250
   },
   {
      id: "pattern",
      label: "pattern",
      type: CELL_TYPE_NUMBER,
      width_px: 50,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "short_form",
      label: "short form",
      type: CELL_TYPE_TEXT,
      width_px: 120
   },
]

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

const TableWrapper = styled(CoolStyles.Block)`
   margin-top: 0.5rem;
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

export class InspectorBailiwicks extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
      all_bailiwicks: [],
      node_points: [],
      bailiwick_id: 0,
      node_index: 0,
      selected_nodes: []
   }

   componentDidMount() {
      const {on_focal_point_changed, on_scope_changed} = this.props
      let bailiwick_id = parseInt(localStorage.getItem(SELECTED_BAILIWICK_KEY))
      BailiwickData.fetch_bailiwicks(all_bailiwicks => {
         if (!bailiwick_id) {
            bailiwick_id = all_bailiwicks[0].id
         }
         this.setState({
            all_bailiwicks: all_bailiwicks,
            bailiwick_id: bailiwick_id,
            node_index: 0,
         })
         setTimeout(() => {
            const bailiwick = all_bailiwicks.find(bailiwick => bailiwick.id === bailiwick_id)
            const display_settings = JSON.parse(bailiwick.display_settings)
            on_focal_point_changed(display_settings.focal_point)
            on_scope_changed(display_settings.scope)
         }, 1000)
      })
      BailiwickData.fetch_node_points(node_points => {
         // console.log("fetch_node_points", node_points)
         this.setState({
            node_points: node_points,
         })
         setTimeout(() => {
            this.select_bailiwick(bailiwick_id)
         }, 1000)
      })
   }

   select_bailiwick = (id) => {
      const {all_bailiwicks, node_points} = this.state
      const {on_focal_point_changed, on_scope_changed} = this.props
      const bailiwick_nodes = node_points.filter(node_point => node_point.bailiwick_id === id)
      const selected_nodes = bailiwick_nodes.sort((a, b) => {
         return a.short_form > b.short_form ? 1 : -1
      })
      this.setState({
         bailiwick_id: id,
         node_index: 0,
         selected_nodes: selected_nodes
      })
      const bailiwick = all_bailiwicks.find(bailiwick => bailiwick.id === id)
      console.log("select_bailiwick", id, bailiwick)
      if (!bailiwick) {
         return;
      }
      const display_settings = JSON.parse(bailiwick.display_settings)
      on_focal_point_changed(display_settings.focal_point)
      on_scope_changed(display_settings.scope)
      localStorage.setItem(SELECTED_BAILIWICK_KEY, `${id}`)
   }

   on_select_row = (index) => {
      const {selected_nodes} = this.state
      const {on_focal_point_changed} = this.props
      this.setState({node_index: index})
      const selected_node = selected_nodes[index]
      const location = JSON.parse(selected_node.location)
      on_focal_point_changed(location)
   }

   on_resize = (factor = 1) => {
      const {all_bailiwicks, bailiwick_id} = this.state
      const {on_scope_changed} = this.props
      const bailiwick = all_bailiwicks.find(bailiwick => bailiwick.id === bailiwick_id)
      const display_settings = JSON.parse(bailiwick.display_settings)
      on_scope_changed(display_settings.scope / factor)
   }

   render() {
      const {all_bailiwicks, bailiwick_id, node_index, selected_nodes} = this.state
      const select_options = all_bailiwicks.map((bailiwick, i) => {
         return {
            label: bailiwick.name,
            value: bailiwick.id,
            help: `#${i}`
         }
      })
      const bailiwicks_list = <CoolSelect
         on_change={e => this.select_bailiwick(parseInt(e.target.value))}
         value={bailiwick_id}
         options={select_options}/>
      const table_rows = selected_nodes.map(node => {
         return {
            name: node.name,
            pattern: node.pattern,
            short_form: node.short_form,
         }
      })
      return <ContentWrapper>
         <SelectWrapper>{bailiwicks_list}</SelectWrapper>
         <LinkWrapper onClick={e => this.on_resize()}><CoolLink>{"re-size"}</CoolLink></LinkWrapper>
         <LinkWrapper onClick={e => this.on_resize(2)}><CoolLink>{"+1"}</CoolLink></LinkWrapper>
         <LinkWrapper onClick={e => this.on_resize(4)}><CoolLink>{"+2"}</CoolLink></LinkWrapper>
         <TableWrapper><CoolTable
            options={TABLE_CAN_SELECT}
            columns={NODES_HEADERS}
            data={table_rows}
            key={'bailiwick-nodes'}
            on_select_row={index => this.on_select_row(index)}
            selected_row={node_index}
         /></TableWrapper>
      </ContentWrapper>
   }
}

export default InspectorBailiwicks;
