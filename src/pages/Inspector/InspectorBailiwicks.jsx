import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolTable} from "common/ui/CoolImports";
import {render_pattern_block} from "fracto/common/FractoStyles";
import BailiwickData from "fracto/common/feature/BailiwickData";
import BailiwickList from "fracto/common/ui/BailiwickList";
import BailiwickDetails from "fracto/common/ui/BailiwickDetails";
import {
   CELL_ALIGN_CENTER, CELL_TYPE_CALLBACK,
   CELL_TYPE_TEXT
} from "common/ui/CoolTable";
import {TABLE_CAN_SELECT} from "common/ui/CoolTable"

const SELECTED_BAILIWICK_KEY = "selected_bailiwick";

const NODES_HEADERS = [
   {
      id: "pattern",
      label: "pattern",
      type: CELL_TYPE_CALLBACK,
      width_px: 50,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "short_form",
      label: "short",
      type: CELL_TYPE_TEXT,
      width_px: 80
   },
   {
      id: "long_form",
      label: "long",
      type: CELL_TYPE_TEXT,
      width_px: 220
   },
]

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
   overflow-x: scroll;
`

const SelectWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.light_border}
   margin: 0;
   height: 35rem;
   overflow-y: scroll;
`

const TableWrapper = styled(CoolStyles.Block)`
   margin-left: 1rem;
   margin-top: 1rem;
`

const DetailsWrapper = styled(CoolStyles.InlineBlock)`
   margin-left: 0.5rem;
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
      node_points: [],
      bailiwick: null,
      node_index: 0,
      selected_nodes: [],
      all_node_points: []
   }

   componentDidMount() {
      let bailiwick_id = parseInt(localStorage.getItem(SELECTED_BAILIWICK_KEY))
      BailiwickData.fetch_bailiwicks(all_bailiwicks => {
         if (!all_bailiwicks.length) {
            return
         }
         if (!bailiwick_id) {
            bailiwick_id = all_bailiwicks[0].id
         }
         const bailiwick = all_bailiwicks.find(b => b.id === bailiwick_id)
         this.fetch_node_points(node_points => {
            this.setState({
               all_bailiwicks: all_bailiwicks,
               all_node_points: node_points,
            })
            setTimeout(() => {
               this.select_bailiwick(bailiwick)
            }, 100)
         })
      })
   }

   fetch_node_points = (cb) => {
      BailiwickData.fetch_node_points(result => {
         cb(result)
      })
   }

   select_bailiwick = (bailiwick) => {
      const {all_node_points, selected_nodes} = this.state
      const {on_focal_point_changed, on_scope_changed, in_wait} = this.props
      if (in_wait && selected_nodes.length) {
         return;
      }
      const new_selected_nodes = all_node_points
         .filter(np => np.bailiwick_id === bailiwick.id)
         .sort((a, b) => {
            return a.pattern - b.pattern
         })
      this.setState({
         bailiwick: bailiwick,
         node_index: 0,
         selected_nodes: new_selected_nodes
      })
      console.log("select_bailiwick", bailiwick)
      const display_settings = JSON.parse(bailiwick.display_settings)
      on_focal_point_changed(display_settings.focal_point)
      on_scope_changed(display_settings.scope)
      localStorage.setItem(SELECTED_BAILIWICK_KEY, `${bailiwick.id}`)
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
      const {bailiwick} = this.state
      const {on_scope_changed} = this.props
      const display_settings = JSON.parse(bailiwick.display_settings)
      on_scope_changed(display_settings.scope / factor)
   }

   render() {
      const {node_index, selected_nodes, bailiwick} = this.state
      const {in_wait, width_px} = this.props
      const bailiwicks_list = <BailiwickList
         on_select={this.select_bailiwick}
         in_wait={in_wait}
      />
      let bailiwick_details = []
      let table_rows = []
      if (bailiwick) {
         table_rows = selected_nodes
            .map(node => {
               return {
                  pattern: [render_pattern_block, node.pattern],
                  short_form: node.short_form,
                  long_form: node.long_form,
               }
            })
         const highest_level = Math.round(100 * (Math.log(32 / bailiwick.magnitude) / Math.log(2))) / 100
         bailiwick_details = <DetailsWrapper><BailiwickDetails
            freeform_index={bailiwick.free_ordinal}
            highest_level={highest_level}
            selected_bailiwick={bailiwick}
         /> </DetailsWrapper>
      }
      return <ContentWrapper>
         <SelectWrapper>{bailiwicks_list}</SelectWrapper>
         <CoolStyles.InlineBlock style={{width: `${width_px - 300}px`}}>
            {bailiwick_details}
            <TableWrapper>
               <CoolTable
                  options={TABLE_CAN_SELECT}
                  columns={NODES_HEADERS}
                  data={table_rows}
                  key={'bailiwick-nodes'}
                  on_select_row={index => this.on_select_row(index)}
                  selected_row={node_index}
               /></TableWrapper>
         </CoolStyles.InlineBlock>
      </ContentWrapper>
   }
}

export default InspectorBailiwicks;
