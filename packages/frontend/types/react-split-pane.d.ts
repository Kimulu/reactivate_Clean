import * as React from "react";

declare module "react-split-pane" {
  export interface SplitPaneProps {
    split?: "vertical" | "horizontal";
    minSize?: number;
    maxSize?: number;
    defaultSize?: number | string;
    size?: number | string;
    allowResize?: boolean;
    onChange?: (newSize: number) => void;
    onDragStarted?: () => void;
    onDragFinished?: (newSize: number) => void;
    className?: string;
    style?: React.CSSProperties;
    resizerClassName?: string;
    // 👇 this fixes the error
    children?: React.ReactNode;
  }

  export default class SplitPane extends React.Component<SplitPaneProps> {}
}
