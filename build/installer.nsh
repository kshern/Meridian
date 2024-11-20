!macro customInstall
  ; Add context menu for folders
  ; For folders in Explorer
  WriteRegStr HKCR "Directory\shell\OpenWithMeridian" "" "Open with Meridian"
  WriteRegStr HKCR "Directory\shell\OpenWithMeridian" "Icon" "$INSTDIR\Meridian.exe"
  WriteRegStr HKCR "Directory\shell\OpenWithMeridian\command" "" '"$INSTDIR\Meridian.exe" "%L"'
  
  ; For right-clicking in the background of a folder
  WriteRegStr HKCR "Directory\Background\shell\OpenWithMeridian" "" "Open with Meridian"
  WriteRegStr HKCR "Directory\Background\shell\OpenWithMeridian" "Icon" "$INSTDIR\Meridian.exe"
  WriteRegStr HKCR "Directory\Background\shell\OpenWithMeridian\command" "" '"$INSTDIR\Meridian.exe" "%V"'

  ; Refresh shell
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUninstall
  ; Remove context menu entries
  DeleteRegKey HKCR "Directory\shell\OpenWithMeridian"
  DeleteRegKey HKCR "Directory\Background\shell\OpenWithMeridian"
  
  ; Refresh shell
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
