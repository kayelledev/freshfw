module Shoppe
  class PermissionsController < Shoppe::ApplicationController
    before_filter { @active_nav = :roles_permissions }
    before_filter { params[:id] && @permission = Permission.find(params[:id]) }
	  load_and_authorize_resource
    include AccessManagementProccessor
    
    def new
      @permission = Permission.new
      @controllers = controllers_list
      @actions = actions_list(@controllers.first) 
      
    end

    def show
      @controllers = controllers_list
      @actions = [] 
    end

    def edit
      @controllers = controllers_list
      @actions = actions_list(@permission.subject_class)
    end

    def index
      redirect_to :roles_permissions
    end

    def create
      begin
        @permission = Permission.new(safe_params)
        if @permission.save
          redirect_to @permission, :flash => {:notice => 'Permission has been created successfully' }
        else
          redirect_to :new_permission, :flash => {:notice => @permission.errors.full_messages }
        end
      rescue Exception => e
        redirect_to :roles_permissions, :flash => {:notice => e.message }
      end
    end

    def update
      begin
        if @permission.update(safe_params)
          redirect_to @permission, :flash => {:notice => 'Permission has been updated successfully' }
        else
          edit
          render :action => "edit"
        end
      rescue Exception => e
        redirect_to :roles_permissions, :flash => {:notice => e.message }
      end
    end

    def destroy
      if @permission.destroy
        redirect_to :roles_permissions, :flash => {:notice =>  'Permission has been removed successfully'}
      else
        redirect_to :roles_permissions, :flash => {:notice =>  @permission.errors.full_messages}
      end
    end

    def get_controller_options
      options = []
      val = params[:controller_name]
      options = actions_list(val)

      render :json => options.to_json
    end

    private

    def safe_params
      params[:permission][:role_ids] ||= []
      params[:permission].permit(:name, :controller_class, :subject_class, :action, :role_ids => [] )
    end
  end
end
