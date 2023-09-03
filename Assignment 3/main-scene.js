window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   )
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),

                                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                                //        (Requirement 1)
                         sun: new Subdivision_Sphere( 4 ),
                         planet_one: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 2 ),
                         planet_two: new Subdivision_Sphere( 3 ),
                         planet_three: new Subdivision_Sphere( 4 ),
                         planet_four: new Subdivision_Sphere( 4 ),
                         moon: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 1 )
                       }
        this.submit_shapes( context, shapes );

                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),

                                // TODO:  Fill in as many additional material objects as needed in this key/value table.
                                //        (Requirement 1)
            sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,.5,.5,1 ), { ambient: 1 }),
            planet_one: context.get_instance( Phong_Shader ).material( Color.of( .765, .796, .851, 1 ), { diffusivity: 1 }),
            planet_two: context.get_instance( Phong_Shader ).material( Color.of( .067, .706, .384, 1 ), { diffusivity: 0.2,
                                                                                                          specular: 1,
                                                                                                          gouraud: 0}),
            planet_three: context.get_instance( Phong_Shader ).material( Color.of( .878, .388, 0, 1 ), { diffusivity: 1,
                                                                                                          specular: 1 }),
            planet_four: context.get_instance( Phong_Shader ).material( Color.of( .294, .42, .784, 1 ), { specular: 0.8 })
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];

        // Initialize attached function
        this.attached = () => this.initial_camera_location;
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;



        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)

        // Problem #1
        // The sun's radius
        let sun_transform = Mat4.identity();
        const sun_radius = (2) + (Math.cos((Math.PI/2.5)*t));
        // The sun's color
        const red_scale = (0.5) + (0.5*Math.cos((Math.PI/2.5)*t));
        const blue_scale = (0.5) - (0.5*Math.cos((Math.PI/2.5)*t));
        const sun_color = Color.of(red_scale, 0, blue_scale, 1);
        // Draw the sun
        sun_transform = sun_transform.times(Mat4.scale([sun_radius, sun_radius, sun_radius]));
        this.shapes.sun.draw( graphics_state, sun_transform, this.materials.sun.override({ color: sun_color }) );

        // Problem #2
        // Override the sun light source to be the current one
        this.lights = [ new Light( Vec.of(0, 0, 0, 1), Color.of(red_scale, 0, blue_scale, 1), 10**sun_radius) ];
        graphics_state.lights = this.lights;

        // Problem #3
        // Planet 1
        let planet_transform = Mat4.identity();
        planet_transform = planet_transform.times(Mat4.rotation(t, Vec.of(0, 1, 0)));
        planet_transform = planet_transform.times(Mat4.translation([5, 0, 0]));
        planet_transform = planet_transform.times(Mat4.rotation(-t, Vec.of(0, 1, 0)));
        this.shapes.planet_one.draw( graphics_state, planet_transform, this.materials.planet_one );
        this.planet_1 = planet_transform;

        // Planet 2
        // Determine if this second is odd or even and set the gouraud accordingly
        let two_gouraud = 0;
        if(Math.floor(t)%2) {
          two_gouraud = 1;
        }
        planet_transform = Mat4.identity();
        planet_transform = planet_transform.times(Mat4.rotation(0.8 * t, Vec.of(0, 1, 0)));
        planet_transform = planet_transform.times(Mat4.translation([8, 0, 0]));
        planet_transform = planet_transform.times(Mat4.rotation(-0.8 * t, Vec.of(0, 1, 0)));
        this.shapes.planet_two.draw( graphics_state, planet_transform, this.materials.planet_two.override({ gouraud: two_gouraud }) );
        this.planet_2 = planet_transform;

        // Planet 3
        planet_transform = Mat4.identity();
        planet_transform = planet_transform.times(Mat4.rotation(0.6 * t, Vec.of(0, 1, 0)));
        planet_transform = planet_transform.times(Mat4.translation([11, 0, 0]));
        planet_transform = planet_transform.times(Mat4.rotation(-0.6 * t, Vec.of(0, 1, 0)));
        // Wobble the planet
        planet_transform = planet_transform.times(Mat4.rotation(t, Vec.of(1, 0, 1)));
        this.shapes.planet_three.draw( graphics_state, planet_transform, this.materials.planet_three );
        this.planet_3 = planet_transform;
        planet_transform = planet_transform.times(Mat4.scale([1, 1, 0.1]));
        this.shapes.torus.draw( graphics_state, planet_transform, this.materials.planet_three );

        // Planet 4
        planet_transform = Mat4.identity();
        planet_transform = planet_transform.times(Mat4.rotation(0.4 * t, Vec.of(0, 1, 0)));
        planet_transform = planet_transform.times(Mat4.translation([14, 0, 0]));
        planet_transform = planet_transform.times(Mat4.rotation(-0.4 * t, Vec.of(0, 1, 0)));
        this.shapes.planet_four.draw( graphics_state, planet_transform, this.materials.planet_four );
        this.planet_4 = planet_transform;
        // Attach an orbiting moon to the planet
        planet_transform = planet_transform.times(Mat4.rotation(1.5 * t, Vec.of(0, 1, 0)));
        planet_transform = planet_transform.times(Mat4.translation([2.3, 0, 0]));
        this.shapes.moon.draw( graphics_state, planet_transform, this.materials.planet_two );
        this.moon = planet_transform;

        // If a pertinent button was toggled, set the appropriate camera
        // Camera matrices blended with desired for Extra Credit 1
        let camera_matrix = this.attached();
          if (camera_matrix === this.initial_camera_location){
              graphics_state.camera_transform = Mat4.inverse(camera_matrix)
                  .map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, .1 ) );
          } else {
              let camera_planet_transformation = Mat4.translation([0,0,-5]).times(Mat4.inverse(camera_matrix));
              graphics_state.camera_transform = camera_planet_transformation
                  .map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, .1 ) );
          }

        // this.shapes.torus2.draw( graphics_state, Mat4.identity(), this.materials.test );

      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused.
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );


                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }