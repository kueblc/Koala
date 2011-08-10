class ApplicationController < ActionController::Base
  protect_from_forgery
  
  def error_listing(var)
    errors = "<div id='errors'>Errors were encountered:<pre>"
    var.errors.full_messages.each do |m|
      errors += "   " + m + "<br>"
    end
    errors += "</div>"
    return errors
  end
  
end
