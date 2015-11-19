module AccessManagementProccessor
  def controllers_list
    arr = []
    # load all controller from /app/controllers
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
    arr
  end

  def actions_list(controller_name)
    actions = []

    controller = controller_name.constantize
    if controller.permission
      actions << 'manage'
      all_methods = controller.public_instance_methods(false).map { |m| m.to_s }
      params_methods = all_methods.grep /param/
      methods = all_methods - params_methods
      methods.each do |method|
        if method =~ /^([A-Za-z\d*]+)+([\w]*)+([A-Za-z\d*]+)$/ #add_user, add_user_info, Add_user, add_User
          actions << method
        end
      end
    end
    actions
  end

  def eval_cancan_action(action)
    case action.to_s
    when "index"
      name = 'list'
      cancan_action = "index" 
      action_desc = 'list'
    when "new", "create"
      name = 'create and update'
      cancan_action = "create"
      action_desc = 'create'
    when "show"
      name = 'show'
      cancan_action = "view"
      action_desc = 'view'
    when "edit", "update"
      name = 'create and update'
      cancan_action = "update"
      action_desc = 'update'
    when "delete", "destroy"
      name = 'delete'
      cancan_action = "destroy"
      action_desc = 'destroy'
    else
      name = action.to_s
      cancan_action = action.to_s
      action_desc = "Other"
    end
    return cancan_action, action_desc
  end
end