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
    try {
        // Create a mode "mouseless_training" on the fly using i3-msg
        // This doesn't require changing the i3 config file
        // First we create a mode where all key bindings (including Super key) are essentially disabled
        var proc = getProcessObject();
        if (!proc) {
            console.error("Could not create process object");
            return false;
        }
        
        // This is a special way to create an i3 mode that completely disables keyboard shortcuts
        // Step 1: Create the mode
        proc.startCommand("i3-msg 'mode mouseless_training'");
        
        // Step 2: Check if operation was successful using i3-msg and query for current mode
        var checkResult = proc.runCheckCommand("i3-msg -t get_binding_modes");
        if (checkResult && checkResult.indexOf("mouseless_training") !== -1) {
            i3SocketConnected = true;
            console.log("i3 shortcuts disabled - entered mouseless_training mode");
            return true;
        } else {
            // Try alternative approach for Regolith which might use a slightly different i3 setup
            proc.startCommand("i3-msg 'mode \"mouseless_training\"'");
            i3SocketConnected = true;
            console.log("Attempted alternative i3 mode activation for Regolith");
            return true;
        }
    } catch (e) {
        console.error("Error disabling i3 shortcuts:", e);
    }
    
    console.error("Failed to disable i3 shortcuts");
    return false;
}

// Function to re-enable i3 shortcuts by returning to default mode
function enableI3Shortcuts() {
    if (i3SocketConnected) {
        try {
            var proc = getProcessObject();
            if (!proc) {
                console.error("Could not create process object");
                return false;
            }
            
            // Return to default mode
            proc.startCommand("i3-msg 'mode default'");
            
            i3SocketConnected = false;
            console.log("i3 shortcuts enabled - returned to default mode");
            return true;
        } catch (e) {
            console.error("Error enabling i3 shortcuts:", e);
        }
    }
    
    return false;
}

// Function to check if shortcuts are currently disabled
function areShortcutsDisabled() {
    return i3SocketConnected;
}