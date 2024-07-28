import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {Scatter} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, BarController} from "chart.js/auto";

import {CoolStyles} from "common/ui/CoolImports";
import {CELL_ALIGN_CENTER, CELL_ALIGN_LEFT, CELL_TYPE_NUMBER, CELL_TYPE_TEXT} from "../../common/ui/CoolTable";
import FractoFastCalc from "../../fracto/common/data/FractoFastCalc";
import {render_coordinates} from "../../fracto/common/FractoStyles";
import Complex from "../../common/math/Complex";

ChartJS.register(CategoryScale, BarController)

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

const TEST_COLUMNS = [
   {
      id: "index",
      label: "exponent",
      type: CELL_TYPE_NUMBER,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "value",
      label: "P",
      type: CELL_TYPE_TEXT,
      align: CELL_ALIGN_LEFT
   },
   {
      id: "calc",
      label: "calc",
      type: CELL_TYPE_TEXT,
      align: CELL_ALIGN_LEFT
   },
]

export class InspectorTest extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      click_point: PropTypes.object.isRequired,
      cursor_point: PropTypes.object.isRequired
   }

   state = {}

   componentDidMount() {
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {click_point} = this.props
      if (click_point
         && (click_point.x !== prevProps.click_point.x
            || click_point.y !== prevProps.click_point.y)) {
         console.log(`click_point: ${click_point.x} ${click_point.y}`)
      }
   }

   click_point_chart = (set1, set2) => {
      const {width_px} = this.props
      const options = {
         scales: {
            x: {
               type: 'linear',
            },
         },
         animation: false
      }
      const data_dataset = {
         datasets: [
            {
               Id: 1,
               label: "set1",
               data: set1,
               backgroundColor: 'red',
               showLine: true
            },
            {
               Id: 2,
               label: "set2",
               data: set2,
               backgroundColor: 'blue'
            },
         ]
      }
      return [
         <Scatter
            width={250}
            height={250}
            datasetIdKey='id1'
            data={data_dataset} options={options}
         />
      ]
   }

   vectors_angle=(a, b)=>{
      const first_angle = Math.atan2(a.y, a.x)
      const second_angle = Math.atan2(b.y, b.x)
      let difference = second_angle - first_angle
      while (difference > 2 * Math.PI) {
         difference -= 2 * Math.PI
      }
      while (difference < 0) {
         difference += 2 * Math.PI
      }
      return difference * 180 / Math.PI
   }

   click_point_data = () => {
      const {click_point} = this.props
      if (!click_point) {
         return []
      }
      const fracto_values = FractoFastCalc.calc(click_point.x, click_point.y)
      // if (fracto_values.pattern !== 5) {
      //    return 'not 5'
      // }
      console.log("fracto_values", fracto_values)

      const P = new Complex(click_point.x, click_point.y)
      const under_radical = P.scale(-4).offset(1, 0)
      const negative_radical = under_radical.sqrt().scale(-1)
      const Q = negative_radical.offset(1, 0).scale(0.5)

      const orbital_points = fracto_values.orbital_points
         ? fracto_values.orbital_points.map((point, point_index) => {
            const angle = point_index === 0
               ? '-'
               : this.vectors_angle(
                  {
                     x: point.x - Q.re,
                     y: point.y - Q.im
                  },
                  {
                     x: fracto_values.orbital_points[point_index - 1].x - Q.re,
                     y: fracto_values.orbital_points[point_index - 1].y - Q.im
                  },
               )
            return <CoolStyles.Block key={`orbital-Q-${point_index}`}>
               {render_coordinates(point.x, point.y)}, {angle}
            </CoolStyles.Block>
         })
         : []
      const Q_center = {x: Q.re, y: Q.im}
      const chart = this.click_point_chart(fracto_values.orbital_points, [Q_center])
      return [
         chart,
         orbital_points,
      ]
   }

   render() {
      return <ContentWrapper>
         {this.click_point_data()}
      </ContentWrapper>
   }
}

export default InspectorTest;
