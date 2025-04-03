.pragma library

// Variables to store socket connection state
var i3SocketConnected = false;
var i3SocketProcess = null;

// Function to get or create the process object
function getProcessObject() {
    if (!i3SocketProcess) {
        try {
            var component = Qt.createComponent("i3socket_process.qml");
            if (component.status === Component.Ready) {
                i3SocketProcess = component.createObject(null);
                console.log("Process component created successfully");
            } else if (component.status === Component.Error) {
                console.error("Error creating process component:", component.errorString());
                return null;
            } else {
                console.log("Component status:", component.status);
                return null;
            }
        } catch (e) {
            console.error("Exception when creating process:", e);
            return null;
        }
    }
    return i3SocketProcess;
}

// Function to disable i3 shortcuts by creating a special mode with no bindings
function disableI3Shortcuts() {
    // On i3, this will switch to a mode that has no key bindings defined
    // We first need to make sure this mode exists in your i3 config
    // Add this to your i3 config: mode "mouseless_training" { }
    var setupModeCommand = 'i3-msg "mode mouseless_training"';
    
    var proc = getProcessObject();
    if (proc) {
        if (proc.startCommand(setupModeCommand)) {
            i3SocketConnected = true;
            console.log("i3 shortcuts disabled - entered mouseless_training mode");
            return true;
        }
    }
    
    console.error("Failed to disable i3 shortcuts");
    return false;
}

// Function to re-enable i3 shortcuts by returning to default mode
function enableI3Shortcuts() {
    if (i3SocketConnected) {
        // Command to return to default mode
        var command = 'i3-msg "mode default"';
        
        var proc = getProcessObject();
        if (proc) {
            if (proc.startCommand(command)) {
                i3SocketConnected = false;
                console.log("i3 shortcuts enabled - returned to default mode");
                return true;
            }
        }
    }
    
    return false;
}

// Function to check if shortcuts are currently disabled
function areShortcutsDisabled() {
    return i3SocketConnected;
}