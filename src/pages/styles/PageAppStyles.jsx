import styled from "styled-components";
import {CoolStyles} from 'common/ui/CoolImports'

export const HEADER_BAR_HEIGHT_REM = 1.35;
export const MAX_SPLITTER_PX = 350
export const SPLITTER_WIDTH_PX = 5;
export const HEADER_HEIGHT_PX = 22;

export class PageAppStyles {

   static HeaderWrapper = styled(CoolStyles.Block)`
       ${CoolStyles.fixed}
       ${CoolStyles.noselect}
       left: 0;
       right: 0;
       top: 0;
       height: ${HEADER_BAR_HEIGHT_REM - 0.1}rem;
       background: linear-gradient(15deg, #edeeef 0%, #fdfeff 50%, #dddedf 90%);
       opacity: 0.8;
       font-family: Arial;
       border-bottom: 0.1rem solid black;
   `;

   static AppTitle = styled(CoolStyles.Block)`
       ${CoolStyles.uppercase}
       ${CoolStyles.align_center}
       ${CoolStyles.narrow_text_shadow}
       font-size: 1.125rem;
       margin: 0 auto;
       letter-spacing: 1.25rem;
       color: #999999;
       text-shadow: 0.125rem 0.125rem 0.5rem rgba(0, 0, 0, 0.25);
   `;

   static PageWrapper = styled.div`
       position: absolute;
       font-family: Arial;
       font-size: 1rem;
       overflow: hidden;
       height: 100%;
       margin: 0;
       top: 0;
       left: 0;
       right: 0;
       background-color: #fafafa;
       overflow-y: auto;
   `;

   static ContentWrapper = styled(CoolStyles.Block)`
       ${CoolStyles.fixed}
       right: 0;
       left: 0;
       top: ${HEADER_BAR_HEIGHT_REM}rem;
       bottom: 0;
       background-color: #f8f8f8;
   `;

   static RightSideWrapper = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.fixed}
       background-color: #dddddd;
       top: ${HEADER_BAR_HEIGHT_REM}rem;
       bottom: 0;
       right: 0;
   `;

   static LeftSideWrapper = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.fixed}
       background-color: #cccccc;
       top: ${HEADER_BAR_HEIGHT_REM}rem;
       bottom: 0;
       left: 0;
   `;

   static ProgressWrapper = styled(CoolStyles.Block)`
       ${CoolStyles.align_center}
       width: 20rem;
       margin: 0.5rem auto;
   `;

   static HeaderProgressWrapper = styled(CoolStyles.Block)`
       ${CoolStyles.align_right}
       position: fixed;
       top: 0;
       right: 25px;
       width: 30rem;
       margin: 0.5rem 0;
   `;

   static TileLoaderLevel = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.monospace}
       position: fixed;
       top: 3px;
       right: 5px;
       color: #333333;
       font-size: 0.85rem;
   `
}

export default PageAppStyles
