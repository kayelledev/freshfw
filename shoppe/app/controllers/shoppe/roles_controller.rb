module Shoppe
  class RolesController < Shoppe::ApplicationController
    before_filter { @active_nav = :roles_permissions }
    before_filter { params[:id] && @role = Shoppe::Role.find(params[:id]) }
	  load_and_authorize_resource
	
	def new
  	  @role = Role.new
  	end

  	def show

  	end

  	def edit
    end

    def index
      redirect_to :roles_permissions
    end

    def create
      begin
        @role = Shoppe::Role.new(safe_params)
        if @role.save
          redirect_to @role, :flash => {:notice =>  'Role has been created successfully' }
        else
          render :action => "new"
        end
      rescue Exception => e
        redirect_to :roles_permissions, :flash => {:notice => e.message }
      end
    end

    def update
      begin
        if @role.update(safe_params)
          redirect_to @role, :flash => {:notice => 'Role has been updated successfully' }
        else
          render :action => "edit"
        end
      rescue Exception => e
        redirect_to :roles_permissions, :flash => {:notice => e.message }
      end 
    end

    def destroy
      if @role.destroy
        redirect_to :roles_permissions, :flash => {:notice => 'Role has been removed successfully'}
      else
        redirect_to :roles_permissions, :flash => {:notice => @role.errors.full_messages }
      end
    end

    private

    def safe_params
      params[:role][:permission_ids] ||= []
      params[:role].permit(:name, :permission_ids => [])
    end

  end
end
