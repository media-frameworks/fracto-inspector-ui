import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolButton} from "common/ui/CoolImports";
import FractoUtil from "../../fracto/common/FractoUtil";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
`

export class InspectorEffects extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      canvas_buffer: PropTypes.array.isRequired,
      ctx: PropTypes.object.isRequired,
   }

   state = {
      effects_running: false
   }

   componentDidMount() {
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
   }

   click_go = () => {
      const {effects_running} = this.state
      const {canvas_buffer, ctx} = this.props
      if (!ctx) {
         return;
      }
      const buffer_width = canvas_buffer.length
      const buffer_height = canvas_buffer[0].length
      // let max_iteration = 0
      // for (let img_x = 0; img_x < buffer_width; img_x++) {
      //    for (let img_y = 0; img_y < buffer_height; img_y++) {
      //       const iteration = canvas_buffer[img_x][img_y][1]
      //       if (iteration > max_iteration) {
      //          max_iteration = iteration
      //       }
      //    }
      // }
      this.setState({effects_running: !effects_running})
      let clock = 0
      const interval = setInterval(() => {
         const start = new Date()
         for (let img_x = 0; img_x < buffer_width; img_x++) {
            for (let img_y = 0; img_y < buffer_height; img_y++) {
               const pattern = canvas_buffer[img_x][img_y][0]
               if (pattern && clock) {
                  continue;
               }
               const iteration = canvas_buffer[img_x][img_y][1]
               if (!pattern) {
                  // const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(clock + iteration, max_iteration - iteration + 100)
                  ctx.fillStyle = `hsl(${(clock + iteration) % 255}, ${50}%, ${50}%)`
               } else {
                  ctx.fillStyle = "black"
               }
               ctx.fillRect(img_x, img_y, 1, 1);
            }
         }
         const end = new Date()
         clock += 5
         console.log("interval sec", (end - start) / 1000.0)
         // clearInterval(interval)
      }, 1000)
   }

   render() {
      const {effects_running} = this.state
      const {ctx} = this.props
      const go_button = <CoolButton
         primary={1}
         on_click={this.click_go}
         content={!effects_running ? "go" : "stop"}
         disabled={!ctx}
      />
      return <ContentWrapper>
         {go_button}
      </ContentWrapper>
   }
}

export default InspectorEffects;
