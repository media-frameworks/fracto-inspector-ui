import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {Scatter} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, BarController} from "chart.js/auto";

import {CoolStyles} from "common/ui/CoolImports";
import FractoFastCalc from "../../fracto/common/data/FractoFastCalc";
import Complex from "../../common/math/Complex";
import FractoRootsOfUnity from "../../fracto/common/data/FractoRootsOfUnity";

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

   click_point_chart = (set1, set2, set3) => {
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
            // {
            //    Id: 3,
            //    label: "set3",
            //    data: set3,
            //    backgroundColor: 'green'
            // },
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

   click_point_table = (P) => {
      const under_radical = P.scale(-4).offset(1, 0)
      const radical_part = under_radical.sqrt().scale(-1);
      const [roots_table_a, roots_table_b] = FractoRootsOfUnity.initialize()
      const roots_data = []
      for (let i = 0; i < roots_table_a.length; i++) {
         let A = new Complex(0, 0)
         let P_exponent_a = new Complex(1, 0)
         const roots_a = roots_table_a[i].coefficients
         const cardinality = roots_table_a[i].cardinality
         for (let root_index_a = 0; root_index_a < roots_a.length; root_index_a++) {
            const term = P_exponent_a.scale(roots_a[root_index_a])
            A = A.add(term)
            P_exponent_a = P_exponent_a.mul(P)
         }
         let B = new Complex(0, 0)
         let P_exponent_b = new Complex(1, 0)
         const roots_b = roots_table_b[i].coefficients
         for (let root_index_b = 0; root_index_b < roots_b.length; root_index_b++) {
            const term = P_exponent_b.scale(roots_b[root_index_b])
            B = B.add(term)
            P_exponent_b = P_exponent_b.mul(P)
         }
         const full_result = radical_part.mul(A).add(B)
         // const full_result = radical_part.offset(1, 0).scale(0.5)
         const z_basis = full_result.nth_root(cardinality)
         const divisor = 1 // Math.pow(2, 1 / cardinality)
         const all_zs = [];
         for (let z_index = 0; z_index < cardinality; z_index++) {
            const negative_one = new Complex(-1, 0)
            const naught_factor = z_index % 2 === 0 ? 1 : -1
            const z_scalar = negative_one.nth_root(z_index + 1)
            const z_root = z_basis.mul(z_scalar).scale(naught_factor * divisor)
            all_zs.push(z_root.toString())
         }
         roots_data.push({
            cardinality: cardinality,
            all_zs: all_zs,
            full_result: full_result.toString(),
            z_basis: z_basis.toString()
         })
      }
      console.log('roots_data', roots_data)
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

      const under_radical2 = P.scale(-4).offset(-3, 0)
      const negative_radical2 = under_radical2.sqrt().scale(-1)
      const Q2 = negative_radical2.offset(-1, 0).scale(0.5)
      const Q2_center = {x: Q2.re, y: Q2.im}

      console.log('fracto_values.orbital_points', fracto_values.orbital_points)
      return [
         this.click_point_chart(
            fracto_values.orbital_points,
            [Q_center],
            [Q2_center]),
         this.click_point_table(P)
      ]
   }

   render() {
      return <ContentWrapper>
         {this.click_point_data()}
      </ContentWrapper>
   }
}

export default TabPatterns;
