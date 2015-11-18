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
            arr << "#{entry.titleize}::#{x.camelize.gsub('.rb', '')}"
          end
        end
      end
    end
    #load all the shoppe controllers
    controllers = Dir.new("#{Rails.root}/shoppe/app/controllers/shoppe").entries
    controllers.each do |entry|
      if entry =~ /_controller/
        #check if the controller is valid
        arr << ('Shoppe::'+ entry.camelize.gsub('.rb', '')).constantize
      elsif entry =~ /^[a-z]*$/ #namescoped controllers
        Dir.new("#{Rails.root}/app/controllers/#{entry}").entries.each do |x|
          if x =~ /_controller/
            arr << "#{entry.titleize}::#{x.camelize.gsub('.rb', '')}"
          end
        end
      end
    end
    arr
  end
end