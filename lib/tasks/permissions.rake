namespace 'permissions' do
  desc "Loading all models and their related controller methods inpermissions table."
  task(:generate => :environment) do
    puts "start task"
    arr = []
    #load all the controllers
    controllers = Dir.new("#{Rails.root}/app/controllers").entries
    controllers.each do |entry|
      if entry =~ /_controller/
        #check if the controller is valid
        arr << entry.camelize.gsub('.rb', '').constantize
      elsif entry =~ /^[a-z]*$/ #namescoped controllers
        Dir.new("#{Rails.root}/app/controllers/#{entry}").entries.each do |x|
          if x =~ /_controller/
            arr << "#{entry.titleize}::#{x.camelize.gsub('.rb', '')}".constantize
          end
        end
      end
    end
    #load all the shoppe controllers
    controllers = Dir.new("#{Rails.root}/shoppe/app/controllers/shoppe").entries
    controllers.each do |entry|
      if entry =~ /_controller/
        #check if the controller is valid
        arr << ('Shoppe::' + entry.camelize.gsub('.rb', '')).constantize
      elsif entry =~ /^[a-z]*$/ #namescoped controllers
        Dir.new("#{Rails.root}/shoppe/app/controllers/shoppe/#{entry}").entries.each do |x|
          if x =~ /_controller/
            arr << "#{entry.titleize}::#{x.camelize.gsub('.rb', '')}".constantize
          end
        end
      end
    end
    #load all models
    # models_arr = []
    # models =  Dir.new("#{Rails.root}/app/models").entries
    # models.each do |entry|
    #   if entry =~ /^[a-z]*$/ #namescoped models
    #     Dir.new("#{Rails.root}/app/models/#{entry}").entries.each do |x|
    #       models_arr << "#{entry.titleize}::#{x.camelize.gsub('.rb', '')}".constantize if x =~ /rb*$/ rescue nil
    #     end
    #   else
    #     models_arr << entry.camelize.gsub('.rb', '').constantize if entry =~ /rb*$/ rescue nil
    #   end
    # end
    #load all shoppe models
    # models =  Dir.new("#{Rails.root}/shoppe/app/models/shoppe").entries
    # models.each do |entry|
    #   if entry =~ /^[a-z]*$/ #namescoped models
    #     Dir.new("#{Rails.root}/shoppe/app/models/shoppe/#{entry}").entries.each do |x|
    #       models_arr << "#{entry.titleize}::#{x.camelize.gsub('.rb', '')}".constantize if x =~ /rb*$/ rescue nil
    #     end
    #   else
    #     models_arr << ('Shoppe::' + entry.camelize.gsub('.rb', '')).constantize if entry =~ /rb*$/ rescue nil
        
    #   end
    # end
    arr.each do |controller|
      #only that controller which represents a model
      permission_name = controller.permission ? controller.permission : controller.non_restfull_permission
        # write_permission(controller.permission, 'manage') #add permission to do CRUD for every model.
        # methods = ['manage', 'read', 'create', 'update', 'destroy']
        # methods.each do |method|
          # if method =~ /^([A-Za-z\d*]+)+([\w]*)+([A-Za-z\d*]+)$/ #add_user, add_user_info, Add_user, add_User
            # write_permission(controller.permission, method)
          # end
        # end        
      # non-restfull controllers 
      # elsif controller.non_restfull_permission
        #create a universal permission for that model. eg "manage User" will allow all actions on User model.
      if permission_name && (! permission_name.include? 'ApplicationController')
        write_permission(permission_name, 'manage') #add permission to do CRUD for every model.
        all_methods = controller.public_instance_methods(false).map { |m| m.to_s }
        params_methods = all_methods.grep /param/
        methods = all_methods - params_methods
        methods.each do |method|
          if method =~ /^([A-Za-z\d*]+)+([\w]*)+([A-Za-z\d*]+)$/ 
            write_permission(permission_name, method)
          end
        end
      end
    end

    # models_arr.each do |model|
    #   methods = ['manage', 'read', 'create', 'update', 'destroy']
    #   methods.each do |method|
    #     if method =~ /^([A-Za-z\d*]+)+([\w]*)+([A-Za-z\d*]+)$/ 
    #       write_permission(model.name, method)
    #     end
    #   end      
    # end
    puts "stop task"
  end
end

  # def eval_permission_data(model, action)
  #   name = action.to_s
  #   cancan_action = action.to_s
  #   action_desc = "Action #{action} for #{controller}"
  #   return name, cancan_action, action_desc
  # end
 
#check if the permission is present else add a new one.
def write_permission(model, action)
  # name, cancan_action, action_desc = eval_permission_data(model, action)
  permission = Permission.where("subject_class = ? and action = ?", model, action)
  unless permission.present?
    permission = Permission.new
    permission.name = action
    permission.action = action
    permission.description = "Action #{action} for #{model}"
    permission.subject_class = model
    permission.save
  end
end