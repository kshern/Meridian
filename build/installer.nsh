!macro customInstall
  ; Add context menu for folders
  WriteRegStr HKCR "Directory\Background\shell\Meridian" "" "Open with Meridian"
  WriteRegStr HKCR "Directory\Background\shell\Meridian" "Icon" "$INSTDIR\Meridian.exe"
  WriteRegStr HKCR "Directory\Background\shell\Meridian\command" "" '"$INSTDIR\Meridian.exe" "%V"'
  
  WriteRegStr HKCR "Directory\shell\Meridian" "" "Open with Meridian"
  WriteRegStr HKCR "Directory\shell\Meridian" "Icon" "$INSTDIR\Meridian.exe"
  WriteRegStr HKCR "Directory\shell\Meridian\command" "" '"$INSTDIR\Meridian.exe" "%1"'
!macroend

!macro customUninstall
  ; Remove context menu entries
  DeleteRegKey HKCR "Directory\Background\shell\Meridian"
  DeleteRegKey HKCR "Directory\shell\Meridian"
!macroend
