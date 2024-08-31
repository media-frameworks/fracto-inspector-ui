import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {Scatter} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, BarController} from "chart.js/auto";

import {CoolStyles} from "common/ui/CoolImports";
import FractoFastCalc from "../../fracto/common/data/FractoFastCalc";
import Complex from "../../common/math/Complex";

ChartJS.register(CategoryScale, BarController)

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class TabPatterns extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      click_point: PropTypes.object.isRequired,
      cursor_point: PropTypes.object.isRequired
   }

   state = {}

   click_point_chart = (set1, set2) => {
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

   click_point_data = () => {
      const {click_point} = this.props
      if (!click_point) {
         return []
      }
      const fracto_values = FractoFastCalc.calc(click_point.x, click_point.y)
      const P = new Complex(click_point.x, click_point.y)
      const under_radical = P.scale(-4).offset(1, 0)
      const negative_radical = under_radical.sqrt().scale(-1)
      const Q = negative_radical.offset(1, 0).scale(0.5)
      const Q_center = {x: Q.re, y: Q.im}
      console.log('fracto_values.orbital_points', fracto_values.orbital_points)
      return this.click_point_chart(fracto_values.orbital_points, [Q_center])
   }

   render() {
      return <ContentWrapper>
         {this.click_point_data()}
      </ContentWrapper>
   }
}

export default TabPatterns;
