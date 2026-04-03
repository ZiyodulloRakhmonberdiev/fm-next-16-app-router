"use client"

import { AlignTools } from "./align-tools"
import { BasicTools } from "./basic-tools"
import { ColorBgTools } from "./color-bg-tools"
import { FontFamilyTool } from "./font-family-tool"
import { MediaTools } from "./media-tools"
import { MobileViewToggle } from "./mobile-view-toggle"
import { QuoteLinkListTools } from "./quote-link-list-tools"
import type {
  EditorToolId,
  MobileViewMode,
  RichTextBg,
  RichTextColor,
  RichTextFont,
} from "./types"

type EditorToolbarProps = {
  mobileViewMode: MobileViewMode
  onMobileViewModeChange: (mode: MobileViewMode) => void
  isToolEnabled: (tool: EditorToolId) => boolean
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onStrike: () => void
  onSub: () => void
  onSup: () => void
  onCode: () => void
  onH1: () => void
  onH2: () => void
  onH3: () => void
  onLink: () => void
  onQuote: () => void
  onBullet: () => void
  onNumbered: () => void
  onAlignLeft: () => void
  onAlignCenter: () => void
  onAlignRight: () => void
  activeColor: RichTextColor
  activeBg: RichTextBg
  activeFont: RichTextFont
  onColor: (value: Exclude<RichTextColor, "">) => void
  onBg: (value: Exclude<RichTextBg, "">) => void
  onFont: (value: Exclude<RichTextFont, "">) => void
  onImage: () => void
  onVideo: () => void
  onAudio: () => void
  onCaption: () => void
}

export function EditorToolbar({
  mobileViewMode,
  onMobileViewModeChange,
  isToolEnabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onSub,
  onSup,
  onCode,
  onH1,
  onH2,
  onH3,
  onLink,
  onQuote,
  onBullet,
  onNumbered,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  activeColor,
  activeBg,
  activeFont,
  onColor,
  onBg,
  onFont,
  onImage,
  onVideo,
  onAudio,
  onCaption,
}: EditorToolbarProps) {
  return (
    <div className="sticky inset-x-0 top-0 z-20 -mx-4 align-start  flex flex-wrap items-center gap-2 border-b bg-background px-4 pb-2 pt-1 text-sm">
      <span className="font-medium text-muted-foreground">Matn tahrirlash</span>
      <MobileViewToggle value={mobileViewMode} onChange={onMobileViewModeChange} />
      <div className="ml-auto flex flex-wrap gap-1">
        <BasicTools
          canUndo={canUndo}
          canRedo={canRedo}
          isToolEnabled={isToolEnabled}
          onUndo={onUndo}
          onRedo={onRedo}
          onBold={onBold}
          onItalic={onItalic}
          onUnderline={onUnderline}
          onStrike={onStrike}
          onSub={onSub}
          onSup={onSup}
          onCode={onCode}
          onH1={onH1}
          onH2={onH2}
          onH3={onH3}
        />
        <QuoteLinkListTools
          isToolEnabled={isToolEnabled}
          onLink={onLink}
          onQuote={onQuote}
          onBullet={onBullet}
          onNumbered={onNumbered}
        />
        <AlignTools
          isToolEnabled={isToolEnabled}
          onLeft={onAlignLeft}
          onCenter={onAlignCenter}
          onRight={onAlignRight}
        />
        <ColorBgTools
          isToolEnabled={isToolEnabled}
          activeColor={activeColor}
          activeBg={activeBg}
          onColor={onColor}
          onBg={onBg}
        />
        {/* <FontFamilyTool
          isToolEnabled={isToolEnabled}
          activeFont={activeFont}
          onChange={onFont}
        /> */}
        <MediaTools
          isToolEnabled={isToolEnabled}
          onImage={onImage}
          onVideo={onVideo}
          onAudio={onAudio}
          onCaption={onCaption}
        />
      </div>
    </div>
  )
}
