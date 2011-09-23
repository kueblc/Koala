class CommentsController < ApplicationController
  before_filter :grab_project
  
  def show
    @comment = Comment.find(params[:comment])
  end
  
  def new
  end
  
  def create
    User.find(session[:user_id])
    
    @comment = @project.Comments.new(params[:comment])
    @comment.user_id = session[:user_id]
    @comment.date_posted = Time.now
    if @comment.save
      redirect_to @project, :notice => "<div class='success'>Posted!</div>"
    else
      redirect_to @project, :notice => error_listing(@comment)
    end
  end
  
  def grab_project
    @project = Project.find(params[:project_id])
  end
  
end
