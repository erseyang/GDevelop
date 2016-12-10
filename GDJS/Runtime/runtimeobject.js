/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * RuntimeObject represents an object being used on a RuntimeScene.
 *
 * The constructor can be called on an already existing RuntimeObject:
 * In this case, the constructor will try to reuse as much already existing members
 * as possible (recycling).
 *
 * However, you should not be calling the constructor on an already existing object
 * which is not a RuntimeObject.
 *
 * @namespace gdjs
 * @class RuntimeObject
 * @constructor
 * @param runtimeScene The RuntimeScene owning the object.
 * @param objectData The data defining the object
 */
gdjs.RuntimeObject = function(runtimeScene, objectData)
{
    this.name = objectData.name || "";
    this._nameId = gdjs.RuntimeObject.getNameIdentifier(this.name);
    this.type = objectData.type || "";
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.zOrder = 0;
    this.hidden = false;
    this.layer = "";
    this.livingOnScene = true;
    this.id = runtimeScene.createNewUniqueId();
    this._runtimeScene = runtimeScene; //This could/should be avoided.

    //Hit boxes:
    if ( this._defaultHitBoxes === undefined ) {
        this._defaultHitBoxes = [];
        this._defaultHitBoxes.push(gdjs.Polygon.createRectangle(0,0));
    }
    this.hitBoxes = this._defaultHitBoxes;
    this.hitBoxesDirty = true;
    if ( this.aabb === undefined )
        this.aabb = { min:[0,0], max:[0,0] };
    else {
        this.aabb.min[0] = 0; this.aabb.min[1] = 0;
        this.aabb.max[0] = 0; this.aabb.max[1] = 0;
    }

    //Variables:
    if ( !this._variables )
        this._variables = new gdjs.VariablesContainer(objectData ? objectData.variables : undefined);
    else
        gdjs.VariablesContainer.call(this._variables, objectData ? objectData.variables : undefined);

    //Forces:
    if ( this._forces === undefined )
        this._forces = [];
    else
        this.clearForces();

    //A force returned by getAverageForce method:
    if (this._averageForce === undefined) this._averageForce = new gdjs.Force(0,0,false);

    //Behaviors:
    if (this._behaviors === undefined)
        this._behaviors = []; //Contains the behaviors of the object

    if (this._behaviorsTable === undefined)
        this._behaviorsTable = new Hashtable(); //Also contains the behaviors: Used when a behavior is accessed by its name ( see getBehavior ).
    else
        this._behaviorsTable.clear();

	for(var i = 0, len = objectData.behaviors.length;i<len;++i) {
		var autoData = objectData.behaviors[i];
        var Ctor = gdjs.getBehaviorConstructor(autoData.type);

        //Try to reuse already existing behaviors.
        if ( i < this._behaviors.length ) {
            if ( this._behaviors[i] instanceof Ctor )
                Ctor.call(this._behaviors[i], runtimeScene, autoData, this);
            else
                this._behaviors[i] = new Ctor(runtimeScene, autoData, this);
        }
        else this._behaviors.push(new Ctor(runtimeScene, autoData, this));

        this._behaviorsTable.put(autoData.name, this._behaviors[i]);
    }
    this._behaviors.length = i;//Make sure to delete already existing behaviors which are not used anymore.
};

gdjs.RuntimeObject.forcesGarbage = []; //Global container for unused forces, avoiding recreating forces each tick.

//Common members functions related to the object and its runtimeScene :

/**
 * Called each time the scene is rendered.
 *
 * @method updateTime
 * @param elapsedTime {Number} The time elapsedTime since the last frame, in **seconds**.
 */
gdjs.RuntimeObject.prototype.updateTime = function(elapsedTime) {
    //Nothing to do.
};

/**
 * Called when the object is created from an initial instance at the startup of the scene.<br>
 * Note this.common properties ( position, angle, z order... ) have already been setup.
 *
 * @method extraInitializationFromInitialInstance
 * @param initialInstanceData The data of the initial instance.
 */
gdjs.RuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    //Nothing to do.
};

/**
 * Remove an object from a scene.<br>
 * Extensions writers, do not change this method. Instead, redefine the onDeletedFromScene method.
 * @method deleteFromScene
 * @param runtimeScene The RuntimeScene owning the object.
 */
gdjs.RuntimeObject.prototype.deleteFromScene = function(runtimeScene) {
    if ( this.livingOnScene ) {
        runtimeScene.markObjectForDeletion(this);
        this.livingOnScene = false;
    }
};

/**
 * Called when the object is removed from its scene.
 *
 * @method onDeletedFromScene
 * @param runtimeScene The RuntimeScene owning the object.
 */
gdjs.RuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    var theLayer = runtimeScene.getLayer(this.layer);
    theLayer.getRenderer().removeRendererObject(this.getRendererObject());
};

//Rendering:

/**
 * Called with a callback function that should be called with the internal
 * object used for rendering by the object (PIXI.DisplayObject...)
 *
 * @method getRendererObject
 * @return {Object} The internal rendered object (PIXI.DisplayObject...)
 */
gdjs.RuntimeObject.prototype.getRendererObject = function() {
};

//Common properties:

/**
 * Get the name of the object.
 * @method getName
 * @return {String} The object's name.
 */
gdjs.RuntimeObject.prototype.getName = function() {
    return this.name;
};

/**
 * Get the name identifier of the object.
 * @method getNameId
 * @return {Number} The object's name identifier.
 */
gdjs.RuntimeObject.prototype.getNameId = function() {
    return this._nameId;
};

/**
 * Get the unique identifier of the object.<br>
 * The identifier is set by the runtimeScene owning the object.<br>
 * You can also use the id property (this._object.id) for increased efficiency instead of
 * calling this method.
 *
 * @method getUniqueId
 * @return {Number} The object identifier
 */
gdjs.RuntimeObject.prototype.getUniqueId = function() {
    return this.id;
}
;
/**
 * Set the position of the object.
 *
 * @method setPosition
 * @param x {Number} The new X position
 * @param y {Number} The new Y position
 */
gdjs.RuntimeObject.prototype.setPosition = function(x,y) {
    this.setX(x);
    this.setY(y);
};

/**
 * Set the X position of the object.
 *
 * @method setX
 * @param x {Number} The new X position
 */
gdjs.RuntimeObject.prototype.setX = function(x) {
    if ( x === this.x ) return;

    this.x = x;
    this.hitBoxesDirty = true;
};

/**
 * Get the X position of the object.
 *
 * @method getX
 * @return {Number} The X position of the object
 */
gdjs.RuntimeObject.prototype.getX = function() {
    return this.x;
};

/**
 * Set the Y position of the object.
 *
 * @method setY
 * @param y {Number} The new Y position
 */
gdjs.RuntimeObject.prototype.setY = function(y) {
    if ( y === this.y ) return;

    this.y = y;
    this.hitBoxesDirty = true;
};

/**
 * Get the Y position of the object.
 *
 * @method getY
 * @return {Number} The Y position of the object
 */
gdjs.RuntimeObject.prototype.getY = function() {
    return this.y;
};

/**
 * Get the X position of the rendered object.<br>
 * For most objects, this will returns the same value as getX(). But if the object
 * has an origin this.is not the same as the point (0,0) of the object displayed,
 * getDrawableX will differs.
 *
 * @method getDrawableX
 * @return {Number} The X position of the rendered object.
 */
gdjs.RuntimeObject.prototype.getDrawableX = function() {
    return this.getX();
};

/**
 * Get the Y position of the rendered object.<br>
 * For most objects, this will returns the same value as getY(). But if the object
 * has an origin this.is not the same as the point (0,0) of the object displayed,
 * getDrawableY will differs.
 *
 * @method getDrawableY
 * @return {Number} The Y position of the rendered object.
 */
gdjs.RuntimeObject.prototype.getDrawableY = function() {
    return this.getY();
};


gdjs.RuntimeObject.prototype.rotateTowardPosition = function(x, y, speed, scene) {
    this.rotateTowardAngle(Math.atan2(y - (this.getDrawableY() + this.getCenterY()),
        x - (this.getDrawableX() + this.getCenterX()))*180/Math.PI, speed, scene);
};

gdjs.RuntimeObject.prototype.rotateTowardAngle = function(angle, speed, runtimeScene) {
    if (speed === 0) {
        this.setAngle(angle);
        return;
    }

    var angularDiff = gdjs.evtTools.common.angleDifference(this.getAngle(), angle);
    var diffWasPositive = angularDiff >= 0;

    var newAngle = this.getAngle() + (diffWasPositive ? -1.0 : 1.0)
        * speed * runtimeScene.getTimeManager().getElapsedTime() / 1000;
    if (gdjs.evtTools.common.angleDifference(newAngle, angle) > 0 ^ diffWasPositive)
        newAngle = angle;
    this.setAngle(newAngle);

    if (this.getAngle() != newAngle) //Objects like sprite in 8 directions does not handle small increments...
        this.setAngle(angle); //...so force them to be in the path angle anyway.
};

gdjs.RuntimeObject.prototype.rotate = function(speed, runtimeScene) {
    this.setAngle(this.getAngle() +
        speed * runtimeScene.getTimeManager().getElapsedTime() / 1000);
};

/**
 * Set the angle of the object.
 *
 * @method setAngle
 * @param angle {Number} The new angle of the object
 */
gdjs.RuntimeObject.prototype.setAngle = function(angle) {
    if ( this.angle === angle ) return;

    this.angle = angle;
    this.hitBoxesDirty = true;
};

/**
 * Get the rotation of the object.
 *
 * @method getAngle
 * @return {Number} The rotation of the object
 */
gdjs.RuntimeObject.prototype.getAngle = function() {
    return this.angle;
};

/**
 * Set the layer of the object.
 *
 * @method setLayer
 * @return {String} The new layer of the object
 */
gdjs.RuntimeObject.prototype.setLayer = function(layer) {
    if (layer === this.layer) return;
    var oldLayer = this._runtimeScene.getLayer(this.layer);

    this.layer = layer;
    var newLayer = this._runtimeScene.getLayer(this.layer);

    var rendererObject = this.getRendererObject();
    oldLayer.getRenderer().removeRendererObject(rendererObject);
    newLayer.getRenderer().addRendererObject(rendererObject, this.zOrder);
};

/**
 * Get the layer of the object.
 *
 * @method getLayer
 * @return {String} The layer of the object
 */
gdjs.RuntimeObject.prototype.getLayer = function() {
    return this.layer;
};

/**
 * Return true if the object is on the specified layer
 *
 * @method isOnLayer
 * @param layer {String} The layer to be tested.
 * @return {Boolean} true if the object is on the specified layer
 */
gdjs.RuntimeObject.prototype.isOnLayer = function(layer) {
    return this.layer === layer;
};


/**
 * Set the Z order of the object.
 *
 * @method setZOrder
 * @param z {Number} The new Z order position of the object
 */
gdjs.RuntimeObject.prototype.setZOrder = function(z) {
    if ( z === this.zOrder ) return;
    this.zOrder = z;

    if ( this.getRendererObject() ) {
        var theLayer = this._runtimeScene.getLayer(this.layer);
        theLayer.getRenderer().changeRendererObjectZOrder(this.getRendererObject(), z);
    }
};

/**
 * Get the Z order of the object.
 *
 * @method getZOrder
 * @return {Number} The Z order of the object
 */
gdjs.RuntimeObject.prototype.getZOrder = function() {
    return this.zOrder;
};

/**
 * Get the container of the object variables
 * @method getVariables
 * @return {variablesContainer} The variables of the object
 */
gdjs.RuntimeObject.prototype.getVariables = function() {
    return this._variables;
};

/**
 * Get the value of a variable considered as a number. Equivalent of variable.getAsNumber()
 * @method getVariableNumber
 * @param variable The variable to be accessed
 * @return The value of the specified variable
 * @static
 */
gdjs.RuntimeObject.getVariableNumber = function(variable) {
    return variable.getAsNumber();
};
gdjs.RuntimeObject.prototype.getVariableNumber = gdjs.RuntimeObject.getVariableNumber;

/**
 * Get the value of a variable considered as a string. Equivalent of variable.getAsString()
 * @method getVariableString
 * @param variable The variable to be accessed
 * @return The string of the specified variable
 * @static
 */
gdjs.RuntimeObject.getVariableString = function(variable) {
    return variable.getAsString();
};

/**
 * Get the number of children from a variable
 * @method getVariableChildCount
 * @param variable The variable to be accessed
 * @return The number of children
 * @static
 */
gdjs.RuntimeObject.getVariableChildCount = function(variable) {
    if (variable.isStructure() == false) return 0;
    return Object.keys(variable.getAllChildren()).length;
};

gdjs.RuntimeObject.prototype.getVariableString = gdjs.RuntimeObject.getVariableString;

/**
 * Shortcut to set the value of a variable considered as a number
 * @method setVariableNumber
 * @param variable The variable to be changed
 * @param newValue {Number} The value to be set
 */
gdjs.RuntimeObject.setVariableNumber = function(variable, newValue) {
    variable.setNumber(newValue);
};
gdjs.RuntimeObject.prototype.setVariableNumber = gdjs.RuntimeObject.setVariableNumber;

/**
 * Shortcut to set the value of a variable considered as a string
 * @method setVariableNumber
 * @param variable The variable to be changed
 * @param newValue {String} The value to be set
 */
gdjs.RuntimeObject.setVariableString = function(variable, newValue) {
    variable.setString(newValue);
};
gdjs.RuntimeObject.prototype.setVariableString = gdjs.RuntimeObject.setVariableString;

/**
 * @method variableChildExists
 * @static
 * @private
 * @param variable The variable to be tested
 * @param childName {String} The name of the child
 */
gdjs.RuntimeObject.variableChildExists = function(variable, childName) {
    return variable.hasChild(childName);
};
gdjs.RuntimeObject.prototype.variableChildExists = gdjs.RuntimeObject.variableChildExists;

/**
 * @method variableRemoveChild
 * @static
 * @private
 * @param variable The variable to be changed
 * @param childName {String} The name of the child
 */
gdjs.RuntimeObject.variableRemoveChild = function(variable, childName) {
    return variable.removeChild(childName);
};
gdjs.RuntimeObject.prototype.variableRemoveChild = gdjs.RuntimeObject.variableRemoveChild;

/**
 * Shortcut to test if a variable exists for the object.
 * @method hasVariable
 * @param name {String} The variable to be tested
 */
gdjs.RuntimeObject.prototype.hasVariable = function(name) {
    return this._variables.has(name);
};

/**
 * Hide or show the object
 * @method hide
 * @param enable {Boolean} Set it to true to hide the object, false to show it.
 */
gdjs.RuntimeObject.prototype.hide = function(enable) {
    if (enable === undefined) enable = true;
    this.hidden = enable;
};

/**
 * Return true if the object is not hidden.
 * @method isVisible
 * @return {Boolean} true if the object is not hidden.
 */
gdjs.RuntimeObject.prototype.isVisible = function() {
    return !this.hidden;
};

/**
 * Return true if the object is hidden.
 * @method isHidden
 * @return {Boolean} true if the object is hidden.
 */
gdjs.RuntimeObject.prototype.isHidden = function() {
    return this.hidden;
};

/**
 * Return the width of the object
 * @method getWidth
 * @return {Number} The width of the object
 */
gdjs.RuntimeObject.prototype.getWidth = function() {
    return 0;
};

/**
 * Return the width of the object
 * @method getHeight
 * @return {Number} The height of the object
 */
gdjs.RuntimeObject.prototype.getHeight = function() {
    return 0;
};

/**
 * Return the X position of the object center, relative to the object position.
 * @method getCenterX
 */
gdjs.RuntimeObject.prototype.getCenterX = function() {
    return this.getWidth() / 2;
};

/**
 * Return the Y position of the object center, relative to the object position.
 * @method getCenterY
 */
gdjs.RuntimeObject.prototype.getCenterY = function() {
    return this.getHeight() / 2;
};

//Forces :

/**
 * Get a force from the garbage, or create a new force is garbage is empty.<br>
 * To be used each time a force is created so as to avoid temporaries objects.
 *
 * @method getRecycledForce
 * @private
 * @param x {Number} The x coordinates of the force
 * @param y {Number} The y coordinates of the force
 * @param clearing {Number} Set the force clearing
 */
gdjs.RuntimeObject.prototype._getRecycledForce = function(x, y, clearing) {
    if ( gdjs.RuntimeObject.forcesGarbage.length === 0 )
        return new gdjs.Force(x, y, clearing);
    else {
        var recycledForce = gdjs.RuntimeObject.forcesGarbage.pop();
        recycledForce.setX(x);
        recycledForce.setY(y);
        recycledForce.setClearing(clearing);
        return recycledForce;
    }
};

/**
 * Add a force to the object to make it moving.
 * @method addForce
 * @param x {Number} The x coordinates of the force
 * @param y {Number} The y coordinates of the force
 * @param clearing {Number} Set the force clearing
 */
gdjs.RuntimeObject.prototype.addForce = function(x,y, clearing) {
    this._forces.push(this._getRecycledForce(x, y, clearing));
};

/**
 * Add a force using polar coordinates.
 * @method addPolarForce
 * @param angle {Number} The angle of the force
 * @param len {Number} The length of the force
 * @param clearing {Number} Set the force clearing
 */
gdjs.RuntimeObject.prototype.addPolarForce = function(angle, len, clearing) {
    var forceX = Math.cos(angle/180*3.14159)*len;
    var forceY = Math.sin(angle/180*3.14159)*len;

    this._forces.push(this._getRecycledForce(forceX, forceY, clearing));
};

/**
 * Add a force oriented toward a position
 * @method addForceTowardPosition
 * @param x {Number} The target x position
 * @param y {Number} The target y position
 * @param len {Number} The force length, in pixels.
 * @param clearing {Number} Set the force clearing
 */
gdjs.RuntimeObject.prototype.addForceTowardPosition = function(x,y, len, clearing) {

    var angle = Math.atan2(y - (this.getDrawableY()+this.getCenterY()),
                           x - (this.getDrawableX()+this.getCenterX()));

    var forceX = Math.cos(angle)*len;
    var forceY = Math.sin(angle)*len;
    this._forces.push(this._getRecycledForce(forceX, forceY, clearing));
};

/**
 * Add a force oriented toward another object.<br>
 * (Shortcut for addForceTowardPosition)
 * @method addForceTowardObject
 * @param obj The target object
 * @param len {Number} The force length, in pixels.
 * @param clearing {Number} Set the force clearing
 */
gdjs.RuntimeObject.prototype.addForceTowardObject = function(obj, len, clearing) {
    if ( obj == null ) return;

    this.addForceTowardPosition(obj.getDrawableX() + obj.getCenterX(),
                                obj.getDrawableY() + obj.getCenterY(),
                                len, clearing);
};

/**
 * Deletes all forces applied on the object
 * @method clearForces
 */
gdjs.RuntimeObject.prototype.clearForces = function() {
    gdjs.RuntimeObject.forcesGarbage.push.apply(gdjs.RuntimeObject.forcesGarbage, this._forces);
    this._forces.length = 0;
};

/**
 * Return true if no forces are applied on the object.
 * @method hasNoForces
 * @return {Boolean} true if no forces are applied on the object.
 */
gdjs.RuntimeObject.prototype.hasNoForces = function() {
    return this._forces.length === 0;
};

/**
 * Called once a step by runtimeScene to update forces magnitudes and
 * remove null ones.
 * @method updateForces
 */
gdjs.RuntimeObject.prototype.updateForces = function(elapsedTime) {
    for(var i = 0;i<this._forces.length;) {
        if(this._forces[i].getClearing() === 0 || this._forces[i].getLength() <= 0.001)
        {
            gdjs.RuntimeObject.forcesGarbage.push(this._forces[i]);
            this._forces.remove(i);
        }
        else
        {
            this._forces[i].setLength(this._forces[i].getLength() - this._forces[i].getLength() * ( 1 - this._forces[i].getClearing() ) * elapsedTime);
            ++i;
        }
    }
};

/**
 * Return a force which is the sum of all forces applied on the object.
 *
 * @method getAverageForce
 * @return {force} A force object.
 */
gdjs.RuntimeObject.prototype.getAverageForce = function() {
    var averageX = 0;
    var averageY = 0;
    for(var i = 0, len = this._forces.length;i<len;++i) {
        averageX += this._forces[i].getX();
        averageY += this._forces[i].getY();
    }

    this._averageForce.setX(averageX);
    this._averageForce.setY(averageY);
    return this._averageForce;
};

/**
 * Return true if the average angle of the forces applied on the object
 * is in a given range.
 *
 * @method averageForceAngleIs
 * @param angle {Number} The angle to be tested.
 * @param toleranceInDegrees {Number} The length of the range :
 * @return {Boolean} true if the difference between the average angle of the forces
 * and the angle parameter is inferior to toleranceInDegrees parameter.
 */
gdjs.RuntimeObject.prototype.averageForceAngleIs = function(angle, toleranceInDegrees) {

    var averageAngle = this.getAverageForce().getAngle();
    if ( averageAngle < 0 ) averageAngle += 360;

    return Math.abs(angle-averageAngle) < toleranceInDegrees/2;
};

//Hit boxes and collision :

/**
 * Get the hit boxes for the object.<br>
 * The default implementation returns a basic bouding box based on the result of getWidth and
 * getHeight. You should probably redefine updateHitBoxes instead of this function.
 *
 * @method getHitBoxes
 * @return {Array} An array composed of polygon.
 */
gdjs.RuntimeObject.prototype.getHitBoxes = function() {
    //Avoid a naive implementation requiring to recreate temporaries each time
    //the function is called:
    //(var rectangle = gdjs.Polygon.createRectangle(this.getWidth(), this.getHeight());
    //...)
    if ( this.hitBoxesDirty ) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
    }
    return this.hitBoxes;
};

/**
 * Update the hit boxes for the object.<br>
 * The default implementation set a basic bouding box based on the result of getWidth and
 * getHeight.
 *
 * You should not call this function by yourself, it is called when necessary by getHitBoxes method.
 * However, you can redefine it if your object need custom hit boxes.
 *
 * @method updateHitBoxes
 */
gdjs.RuntimeObject.prototype.updateHitBoxes = function() {

    //Ensure we're using the default hitbox (a single rectangle)
    this.hitBoxes = this._defaultHitBoxes;

    var width = this.getWidth();
    var height = this.getHeight();
    this.hitBoxes[0].vertices[0][0] =-width/2.0;
    this.hitBoxes[0].vertices[0][1] =-height/2.0;
    this.hitBoxes[0].vertices[1][0] =+width/2.0;
    this.hitBoxes[0].vertices[1][1] =-height/2.0;
    this.hitBoxes[0].vertices[2][0] =+width/2.0;
    this.hitBoxes[0].vertices[2][1] =+height/2.0;
    this.hitBoxes[0].vertices[3][0] =-width/2.0;
    this.hitBoxes[0].vertices[3][1] =+height/2.0;

    this.hitBoxes[0].rotate(this.getAngle()/180*3.14159);
    this.hitBoxes[0].move(this.getDrawableX()+this.getCenterX(), this.getDrawableY()+this.getCenterY());
};

//Experimental
gdjs.RuntimeObject.prototype.getAABB = function() {
    if ( this.hitBoxesDirty ) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
    }

    return this.aabb;
};

gdjs.RuntimeObject.prototype.updateAABB = function() {
    this.aabb.min[0] = this.getDrawableX();
    this.aabb.min[1] = this.getDrawableY();
    this.aabb.max[0] = this.aabb.min[0] + this.getWidth();
    this.aabb.max[1] = this.aabb.min[1] + this.getHeight();
};

//Behaviors:

/**
 * Call each behavior stepPreEvents method.
 * @method stepBehaviorsPreEvents
 */
gdjs.RuntimeObject.prototype.stepBehaviorsPreEvents = function(runtimeScene) {
    for(var i = 0, len = this._behaviors.length;i<len;++i) {
        this._behaviors[i].stepPreEvents(runtimeScene);
    }
};

/**
 * Call each behavior stepPostEvents method.
 * @method stepBehaviorsPostEvents
 */
gdjs.RuntimeObject.prototype.stepBehaviorsPostEvents = function(runtimeScene) {
    for(var i = 0, len = this._behaviors.length;i<len;++i) {
        this._behaviors[i].stepPostEvents(runtimeScene);
    }
};

/**
 * Get a behavior from its name.<br>
 * Be careful, the behavior must exists, no check is made on the name.
 * @method getBehavior
 * @param name {String} The behavior name.
 */
gdjs.RuntimeObject.prototype.getBehavior = function(name) {
    return this._behaviorsTable.get(name);
};

/**
 * Check if a behavior is used by the object.
 *
 * @method hasBehavior
 * @param name {String} The behavior name.
 */
gdjs.RuntimeObject.prototype.hasBehavior = function(name) {
    return this._behaviorsTable.containsKey(name);
};

/**
 * De/activate a behavior of the object.
 *
 * @method activateBehavior
 * @param name {String} The behavior name.
 * @param enable {Boolean} true to activate the behavior
 */
gdjs.RuntimeObject.prototype.activateBehavior = function(name, enable) {
    if ( this._behaviorsTable.containsKey(name) ) {
        this._behaviorsTable.get(name).activate(enable);
    }
};

/**
 * Check if a behavior is activated
 *
 * @method behaviorActivated
 * @param name {String} The behavior name.
 * @return true if the behavior is activated.
 */
gdjs.RuntimeObject.prototype.behaviorActivated = function(name) {
    if ( this._behaviorsTable.containsKey(name) ) {
        this._behaviorsTable.get(name).activated();
    }

    return false;
};

//Other :

/**
 * Separate the object from others objects, using their hitboxes.
 * @method separateFromObjects
 * @param objects Objects
 * @return true if the object was moved
 */
gdjs.RuntimeObject.prototype.separateFromObjects = function(objects) {
   var moved = false;
   var xMove = 0; var yMove = 0;
   var hitBoxes = this.getHitBoxes();

   //Check if their is a collision with each object
   for(var i = 0, len = objects.length;i<len;++i) {
       if ( objects[i].id != this.id ) {
           var otherHitBoxes = objects[i].getHitBoxes();

           for(var k = 0, lenk = hitBoxes.length;k<lenk;++k) {
               for(var l = 0, lenl = otherHitBoxes.length;l<lenl;++l) {
                   var result = gdjs.Polygon.collisionTest(hitBoxes[k], otherHitBoxes[l]);
                   if ( result.collision ) {
                       xMove += result.move_axis[0];
                       yMove += result.move_axis[1];
                       moved = true;
                   }
               }
           }
       }
   }

   //Move according to the results returned by the collision algorithm.
   this.setPosition(this.getX()+xMove, this.getY()+yMove);
   return moved;
};

/**
 * Separate the object from others objects, using their hitboxes.
 * @method separateFromObjectsList
 * @param objectsLists Tables of objects
 * @return true if the object was moved
 */
gdjs.RuntimeObject.prototype.separateFromObjectsList = function(objectsLists) {
    var moved = false;
    var xMove = 0; var yMove = 0;
    var hitBoxes = this.getHitBoxes();

    for(var name in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(name)) {
            var objects = objectsLists.items[name];

            //Check if their is a collision with each object
            for(var i = 0, len = objects.length;i<len;++i) {
                if ( objects[i].id != this.id ) {
                    var otherHitBoxes = objects[i].getHitBoxes();

                    for(var k = 0, lenk = hitBoxes.length;k<lenk;++k) {
                        for(var l = 0, lenl = otherHitBoxes.length;l<lenl;++l) {
                            var result = gdjs.Polygon.collisionTest(hitBoxes[k], otherHitBoxes[l]);
                            if ( result.collision ) {
                                xMove += result.move_axis[0];
                                yMove += result.move_axis[1];
                                moved = true;
                            }
                        }
                    }
                }
            }
        }
    }

    //Move according to the results returned by the collision algorithm.
    this.setPosition(this.getX()+xMove, this.getY()+yMove);
    return moved;
};

/**
 * Get the distance, in pixels, to another object.
 * @method getDistanceToObject
 * @param otherObject The other object
 */
gdjs.RuntimeObject.prototype.getDistanceToObject = function(otherObject) {
    return Math.sqrt(this.getSqDistanceToObject(otherObject));
};

/**
 * Get the squared distance, in pixels, to another object.
 * @method getSqDistanceToObject
 * @param otherObject The other object
 */
gdjs.RuntimeObject.prototype.getSqDistanceToObject = function(otherObject) {
    if ( otherObject === null ) return 0;

    var x = this.getX()+this.getCenterX() - (otherObject.getX()+otherObject.getCenterX());
    var y = this.getY()+this.getCenterY() - (otherObject.getY()+otherObject.getCenterY());

    return x*x+y*y;
};

/**
 * Get the squared distance, in pixels, to a position.
 * @method getSqDistanceTo
 * @param pointX {Number} X position
 * @param pointY {Number} Y position
 */
gdjs.RuntimeObject.prototype.getSqDistanceTo = function(pointX, pointY) {
    var x = this.getX()+this.getCenterX() - pointX;
    var y = this.getY()+this.getCenterY() - pointY;

    return x*x+y*y;
};

/**
 * Put the object around a position, with a specific distance and angle.<br>
 * The distance is computed between the position and the center of the object.
 *
 * @method putAround
 * @param x {Number} The x position of the target
 * @param y {Number} The y position of the target
 * @param distance {Number} The distance between the object and the target
 * @param angleInDegrees {Number} The angle between the object and the target, in degrees.
 */
gdjs.RuntimeObject.prototype.putAround = function(x,y,distance,angleInDegrees) {
    var angle = angleInDegrees/180*3.14159;

    this.setX( x + Math.cos(angle)*distance - this.getCenterX() );
    this.setY( y + Math.sin(angle)*distance - this.getCenterY() );
};

/**
 * Put the object around another object, with a specific distance and angle.<br>
 * The distance is computed between the centers of the objects.
 *
 * @method putAround
 * @param obj The target object
 * @param distance {Number} The distance between the object and the target
 * @param angleInDegrees {Number} The angle between the object and the target, in degrees.
 */
gdjs.RuntimeObject.prototype.putAroundObject = function(obj,distance,angleInDegrees) {
    this.putAround(obj.getX()+obj.getCenterX(), obj.getY()+obj.getCenterY(),
                   distance, angleInDegrees);
};

/**
 * @method separateObjectsWithoutForces
 * @deprecated
 * @param objectsLists Tables of objects
 */
gdjs.RuntimeObject.prototype.separateObjectsWithoutForces = function(objectsLists) {

    //Prepare the list of objects to iterate over.
    var objects = gdjs.staticArray(gdjs.RuntimeObject.prototype.separateObjectsWithoutForces);
    objects.length = 0;

    var lists = gdjs.staticArray2(gdjs.RuntimeObject.prototype.separateObjectsWithoutForces);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        objects.push.apply(objects, lists[i]);
    }

    for(var i = 0, len = objects.length;i<len;++i) {
        if ( objects[i].id != this.id ) {
            if ( this.getDrawableX() < objects[i].getDrawableX() ){
                this.setX( objects[i].getDrawableX() - this.getWidth() );
            }
            else if ( this.getDrawableX()+this.getWidth() > objects[i].getDrawableX()+objects[i].getWidth() ){
                this.setX( objects[i].getDrawableX()+objects[i].getWidth() );
            }

            if ( this.getDrawableY() < objects[i].getDrawableY() ){
                this.setY( objects[i].getDrawableY() - this.getHeight() );
            }
            else if ( this.getDrawableY()+this.getHeight() > objects[i].getDrawableY()+objects[i].getHeight() ){
                this.setY( objects[i].getDrawableY()+objects[i].getHeight() );
            }
        }
    }
};

/**
 * @method SeparateObjectsWithForces
 * @deprecated
 * @param objectsLists Tables of objects
 */
gdjs.RuntimeObject.prototype.separateObjectsWithForces = function(objectsLists, len) {

    if ( len == undefined ) len = 10;

    //Prepare the list of objects to iterate over.
    var objects = gdjs.staticArray(gdjs.RuntimeObject.prototype.separateObjectsWithForces);
    objects.length = 0;

    var lists = gdjs.staticArray2(gdjs.RuntimeObject.prototype.separateObjectsWithForces);
    objectsLists.values(lists);
    for(var i = 0, len = lists.length;i<len;++i) {
        objects.push.apply(objects, lists[i]);
    }

    for(var i = 0, len = objects.length;i<len;++i) {
        if ( objects[i].id != this.id ) {
            if ( this.getDrawableX()+this.getCenterX() < objects[i].getDrawableX()+objects[i].getCenterX() )
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getX();
                this.addForce( -av - 10, 0, false );
            }
            else
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getX();
                this.addForce( -av + 10, 0, false );
            }

            if ( this.getDrawableY()+this.getCenterY() < objects[i].getDrawableY()+objects[i].getCenterY() )
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getY();
                this.addForce( 0, -av - 10, false );
            }
            else
            {
                var av = this.hasNoForces() ? 0 : this.getAverageForce().getY();
                this.addForce( 0, -av + 10, false );
            }
        }
    }
};

/**
 * Return true if the hitboxes of two objects are overlapping
 * @method collisionTest
 * @static
 * @param obj1 The first runtimeObject
 * @param obj2 The second runtimeObject
 */
gdjs.RuntimeObject.collisionTest = function(obj1, obj2) {

    //First check if bounding circle are too far.
    var o1w = obj1.getWidth();
    var o1h = obj1.getHeight();
    var o2w = obj2.getWidth();
    var o2h = obj2.getHeight();

    var x = obj1.getDrawableX()+obj1.getCenterX()-(obj2.getDrawableX()+obj2.getCenterX());
    var y = obj1.getDrawableY()+obj1.getCenterY()-(obj2.getDrawableY()+obj2.getCenterY());
    var obj1BoundingRadius = Math.sqrt(o1w*o1w+o1h*o1h)/2.0;
    var obj2BoundingRadius = Math.sqrt(o2w*o2w+o2h*o2h)/2.0;

    if ( Math.sqrt(x*x+y*y) > obj1BoundingRadius + obj2BoundingRadius )
        return false;

    //Do a real check if necessary.
    var hitBoxes1 = obj1.getHitBoxes();
    var hitBoxes2 = obj2.getHitBoxes();
    for(var k = 0, lenBoxes1 = hitBoxes1.length;k<lenBoxes1;++k) {
        for(var l = 0, lenBoxes2 = hitBoxes2.length;l<lenBoxes2;++l) {
            if ( gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l]).collision ) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Check the distance between two objects.
 * @method distanceTest
 * @static
 */
gdjs.RuntimeObject.distanceTest = function(obj1, obj2, distance) {
    return obj1.getSqDistanceToObject(obj2) <= distance;
};

/**
 * Return true if the specified position is inside object bounding box.
 *
 * The position should be in "world" coordinates, i.e use gdjs.Layer.convertCoords
 * if you need to pass the mouse or a touch position that you get from gdjs.InputManager.
 *
 * @method insideObject
 */
gdjs.RuntimeObject.prototype.insideObject = function(x, y) {
    return this.getDrawableX() <= x
        && this.getDrawableX() + this.getWidth() >= x
        && this.getDrawableY() <= y
        && this.getDrawableY() + this.getHeight() >= y;
}

/**
 * Return true if the cursor, or any touch, is on the object.
 *
 * @method cursorOnObject
 * @return true if the cursor, or any touch, is on the object.
 */
gdjs.RuntimeObject.prototype.cursorOnObject = function(runtimeScene) {
    var inputManager = runtimeScene.getGame().getInputManager();
    var layer = runtimeScene.getLayer(this.layer);

    var mousePos = layer.convertCoords(inputManager.getMouseX(), inputManager.getMouseY());
    if (this.insideObject(mousePos[0], mousePos[1])) {
        return true;
    }

    var touchIds = inputManager.getAllTouchIdentifiers();
    for(var i = 0;i<touchIds.length;++i) {
        var touchPos = layer.convertCoords(inputManager.getTouchX(touchIds[i]),
            inputManager.getTouchY(touchIds[i]));

        if (this.insideObject(touchPos[0], touchPos[1])) {
            return true;
        }
    }

    return false;
};


/**
 * Get the identifier associated to an object name :<br>
 * Some features may want to compare objects name a large number of time. In this case,
 * it may be more efficient to compare objects name identifier ( see gdjs.RuntimeObject.getNameId ).
 * @method getNameIdentifier
 * @static
 */
gdjs.RuntimeObject.getNameIdentifier = function(name) {
    gdjs.RuntimeObject.getNameIdentifier.identifiers =
        gdjs.RuntimeObject.getNameIdentifier.identifiers
        || new Hashtable();

    if ( gdjs.RuntimeObject.getNameIdentifier.identifiers.containsKey(name) )
        return gdjs.RuntimeObject.getNameIdentifier.identifiers.get(name);

    gdjs.RuntimeObject.getNameIdentifier.newId =
        (gdjs.RuntimeObject.getNameIdentifier.newId || 0) + 1;
    var newIdentifier = gdjs.RuntimeObject.getNameIdentifier.newId;

    gdjs.RuntimeObject.getNameIdentifier.identifiers.put(name, newIdentifier);
    return newIdentifier;
};

//Notify gdjs the RuntimeObject exists.
gdjs.RuntimeObject.thisIsARuntimeObjectConstructor = "";
