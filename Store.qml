pragma Singleton
import QtQuick 2.15
import "keydata.js" as Fn
import "i3ipc.js" as I3

QtObject {
    // State properties

    property int currentIndex: 0
    property var activeKeys: ({})
    property var expectedSequence: []
    property int currentStep: 0
    property var keyColors: []
    property bool allkeys: true
    property int count: 1
    property bool skipright: true
    
    // i3 integration property
    property bool i3ShortcutsDisabled: false

    // UI properties
    property string resultText: ""
    property color resultColor: "white"
    property real resultOpacity: 0

    // Timers
    property Timer nextShortcutTimer: Timer {
        interval: 1500
        onTriggered: advanceShortcut()
    }

    property Timer errorResetTimer: Timer {
        interval: 1000
        onTriggered: resultOpacity = 0
    }
    
    // Initialize i3 integration when app starts training mode
    function initI3Integration() {
        i3ShortcutsDisabled = I3.disableI3Shortcuts();
        console.log("i3 integration initialized, shortcuts disabled:", i3ShortcutsDisabled);
    }
    
    // Restore i3 shortcuts when going back to menu
    function restoreI3Shortcuts() {
        if (i3ShortcutsDisabled) {
            i3ShortcutsDisabled = !I3.enableI3Shortcuts();
            console.log("i3 shortcuts restored, disabled status:", i3ShortcutsDisabled);
        }
    }

    function resetSequence() {
        allkeys = true
        currentStep = 0
        activeKeys = {}
        keyColors = new Array(Fn.dataset[currentIndex].key.length).fill("white")
        expectedSequence = Fn.dataset[currentIndex].key
    }

    function checkKeyPress(event) {
        const currentKey = expectedSequence[currentStep]
        const isModifier = ["Ctrl", "Shift", "Alt"].includes(currentKey)
        let keyMatch = false

        if (currentKey === "Ctrl") {
            keyMatch = event.modifiers & Qt.ControlModifier
        } else if (currentKey === "Shift") {
            keyMatch = event.modifiers & Qt.ShiftModifier
        } else if (currentKey === "Alt") {
            keyMatch = event.modifiers & Qt.AltModifier
        } else {
            keyMatch = event.key === currentKey.charCodeAt(0)
        }

        return keyMatch && !activeKeys[currentKey]
    }

    function handleKeyPress(event) {
        if (event.isAutoRepeat) return

        else if (event.key === Qt.Key_Escape)
         {
             // Restore i3 shortcuts when Escape is pressed
             restoreI3Shortcuts()
             event.accepted=true
             return
         }
        else if (event.key === Qt.Key_Enter || event.key === Qt.Key_Return) {
            resetSequence()
        }
        else if (event.key === Qt.Key_Right && currentStep === 0) {
            skipRight()
        }
        else if (event.key === Qt.Key_Left && currentStep === 0) {
            skipLeft()
        }
        else {
            const currentKey = expectedSequence[currentStep]
            if (checkKeyPress(event)) {
                activeKeys[currentKey] = true
                var newColors = keyColors.slice()
                newColors[currentStep] = "green"
                keyColors = newColors
                currentStep++

                if (currentStep === expectedSequence.length) {
                    showResult(allkeys)
                    nextShortcutTimer.start()
                }
                event.accepted = true
            } else {
                activeKeys[currentKey] = true
                 newColors = keyColors.slice()
                newColors[currentStep] = "red"
                keyColors = newColors
                currentStep++
                allkeys = false
                if (currentStep === expectedSequence.length) {
                    showResult(allkeys)
                }
            }
        }
    }

    function handleKeyRelease(event) {
        const releasedKey = Object.keys(activeKeys).find(key =>
            (key === "Ctrl" && !(event.modifiers & Qt.ControlModifier)) ||
            (key === "Shift" && !(event.modifiers & Qt.ShiftModifier)) ||
            (key === "Alt" && !(event.modifiers & Qt.AltModifier)) ||
            (event.key === key.charCodeAt(0))
        )

             if((event.key=== Qt.Key_Right || event.key=== Qt.Key_Left) && currentStep==0)
             {
                 resetSequence()
             }

            else if(event.key === Qt.Key_Enter || event.key===Qt.Key_Return)
             {
                 resetSequence()
             }

          else if (releasedKey) {

               delete activeKeys[releasedKey]
                if (currentStep > 0 && currentStep < expectedSequence.length) {
                   showResult(false)
                   currentStep = 0
                   resetSequence()
            }
        }
        else{
               delete activeKeys[releasedKey]
                 showResult(false)
                 currentStep =0
                resetSequence()
            }
    }


    function skipRight() {
        currentIndex = (currentIndex + 1) < Fn.dataset.length ? currentIndex + 1 : Fn.dataset.length
        count = ((count + 1) < Fn.dataset.length + 1) ? count + 1 : Fn.dataset.length
        resetSequence()
    }

    function skipLeft() {
        currentIndex = (currentIndex - 1) > 0 ? currentIndex - 1 : 0
        count = (count - 1) > 0 ? count - 1 : 1
        resetSequence()
    }

    function advanceShortcut() {
        currentIndex = (currentIndex + 1) % Fn.dataset.length
        count = ((count + 1) % (Fn.dataset.length + 1)) == 0 ? 1 : count + 1
        resetSequence()
        resultOpacity = 0
    }

    function showResult(success) {
        resultText = success ? "✓ Correct!" : "✗ Try Again!"
        resultColor = success ? "green" : "red"
        resultOpacity = 1
        if (!success) errorResetTimer.restart()
    }
    
    // Ensure i3 shortcuts are restored when app is closed or crashed
    Component.onDestruction: {
        restoreI3Shortcuts()
    }
}
