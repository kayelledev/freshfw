module Shoppe
  class PermissionsController < Shoppe::ApplicationController
	  # load_and_authorize_resource
    before_filter { @active_nav = :access_management }
    before_filter { params[:id] && @permission = Permission.find(params[:id]) }
    include AccessManagementProccessor
    
    def new
      @permission = Permission.new
      @controllers = controllers_list
      
    end

    def show
    end

    def edit
    end

    def index
      redirect_to :roles_permissions
    end

    def create
      @permission = Permission.new(safe_params)
      if @permission.save
        redirect_to @permission, :flash => {:notice =>  'Permission has been created successfully' }
      else
        render :action => "new"
      end
    end

    def update
      if @permission.update(safe_params)
        redirect_to @permission, :flash => {:notice => 'Permission has been updated successfully' }
      else
        render :action => "edit"
      end
    end

    def destroy
      @permission.destroy
      redirect_to :roles_permission, :flash => {:notice => 'Permission has been removed successfully'}
    end

    private

    def safe_params
      params[:permission][:permission_ids] ||= []
      params[:permission].permit(:name, :subject_class, :permission_ids => [] )
    end
  end
end
