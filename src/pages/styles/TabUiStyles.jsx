import styled from "styled-components";
import {CoolStyles} from "common/ui/CoolImports";

export class TabUiStyles {

   static ContentWrapper = styled(CoolStyles.Block)`
       ${CoolStyles.align_center}
       padding: 0.125rem;
       background-color: white;
       height: fit-content;
       margin 0;
   `
   static LevelSelectorWrapper = styled(CoolStyles.InlineBlock)`
       padding: 0.5rem;
       background-color: white;
   `

   static LevelButton = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.monospace}
       ${CoolStyles.bold}
       ${CoolStyles.align_center}
       ${CoolStyles.pointer}
       background-color: #888888;
       color: white;
       margin: 1px;
       border-radius: 3px;
       padding: 0.125rem 0 0;
       font-size: 0.75rem;
       border: 1px solid black;
   `;

   static SelectPrompt = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.italic}
       ${CoolStyles.align_center}
       color: #aaaaaa;
       letter-spacing: 2px;
       font-size: 0.9rem;
   `

   static InventoryHeader = styled(CoolStyles.Block)`
       ${CoolStyles.align_center}
   `
}

export default TabUiStyles
